export interface AIAction {
  type: string;
  [key: string]: any;
}

/**
 * Robustly extracts the top-level JSON substring starting at `{` following `ACTION_TRIGGER`.
 * Properly handles nested braces `{}` inside double quotes `"..."`, single quotes `'...'`,
 * or backtick template literals ```...```, plus escape sequences (`\`).
 */
function extractJsonAfterActionTrigger(text: string, triggerIndex: number): { jsonStr: string; startIndex: number; endIndex: number } | null {
  const firstBrace = text.indexOf('{', triggerIndex);
  if (firstBrace === -1) return null;

  let depth = 0;
  let inString: string | null = null;
  let isEscaped = false;

  for (let i = firstBrace; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === inString) {
        inString = null;
      }
    } else {
      if (char === '"' || char === "'" || char === '`') {
        inString = char;
      } else if (char === '{') {
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0) {
          return {
            jsonStr: text.substring(firstBrace, i + 1),
            startIndex: firstBrace,
            endIndex: i + 1
          };
        }
      }
    }
  }

  // Fallback for truncated LLM responses (depth > 0)
  if (depth > 0) {
    return {
      jsonStr: text.substring(firstBrace),
      startIndex: firstBrace,
      endIndex: text.length
    };
  }

  return null;
}

/**
 * Converts raw unescaped newlines/tabs inside string literals ("...", '...')
 * into escaped sequences (\n, \r, \t) so JSON.parse or Function() won't throw SyntaxError.
 */
function sanitizeStringLiterals(str: string): string {
  let result = '';
  let inString: string | null = null;
  let isEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        result += ch;
      } else if (ch === '\\') {
        isEscaped = true;
        result += ch;
      } else if (ch === inString) {
        inString = null;
        result += ch;
      } else {
        if (ch === '\n') result += '\\n';
        else if (ch === '\r') result += '\\r';
        else if (ch === '\t') result += '\\t';
        else result += ch;
      }
    } else {
      if (ch === '"' || ch === "'") {
        inString = ch;
      }
      result += ch;
    }
  }

  return result;
}

/**
 * Multi-attempt parser for candidate action JSON/JS objects.
 */
function parseCandidateObject(rawStr: string): any {
  const trimmed = rawStr.trim();
  if (!trimmed) return null;

  // Attempt 1: Standard JSON.parse
  try {
    return JSON.parse(trimmed);
  } catch {}

  // Attempt 2: JSON.parse after sanitizing unescaped newlines/tabs in strings
  try {
    const sanitized = sanitizeStringLiterals(trimmed);
    return JSON.parse(sanitized);
  } catch {}

  // Attempt 3: JavaScript Object Literal evaluation via Function constructor
  try {
    let jsExpr = trimmed
      .replace(/[\u201C\u201D\u201E]/g, '"')
      .replace(/[\u2018\u2019\u201A]/g, "'");

    jsExpr = sanitizeStringLiterals(jsExpr);

    const evalResult = new Function(`return (${jsExpr});`)();
    if (evalResult && typeof evalResult === 'object') {
      return evalResult;
    }
  } catch {
    // Attempt 4: Regex-based field extraction for action attributes
    try {
      const typeMatch = /"(?:type)"\s*:\s*"([^"]+)"|'type'\s*:\s*'([^']+)'|type\s*:\s*"([^"]+)"/i.exec(trimmed);
      const type = typeMatch ? (typeMatch[1] || typeMatch[2] || typeMatch[3]) : null;

      if (type) {
        const obj: any = { type };
        const effectMatch = /"effect"\s*:\s*"([^"]+)"|effect\s*:\s*"([^"]+)"/i.exec(trimmed);
        if (effectMatch) obj.effect = effectMatch[1] || effectMatch[2];

        const enabledMatch = /"enabled"\s*:\s*(true|false)|enabled\s*:\s*(true|false)/i.exec(trimmed);
        if (enabledMatch) obj.enabled = (enabledMatch[1] || enabledMatch[2]) === 'true';

        // Extract wgslCode if present in raw string
        const wgslMatch = /"(?:wgslCode|wgsl|code|shader)"\s*:\s*"([\s\S]*)"\s*\}?$/i.exec(trimmed);
        if (wgslMatch && wgslMatch[1]) {
          obj.wgslCode = wgslMatch[1];
        }

        return obj;
      }
    } catch {}
  }

  return null;
}

/**
 * Searches full text for any WGSL / shader code blocks in markdown fences.
 */
function extractWgslFromText(fullText: string): string {
  // Pattern 1: Specified language code blocks (wgsl, shader, glsl, javascript, etc.) with WGSL indicators
  const wgslKeywordsRegex = /```(?:wgsl|wgsl-shader|shader|glsl|javascript|wgslCode)?\s*([\s\S]*?(?:vec[234]f|textureSample|sceneTexture|params\.time|@fragment|@group|struct\s+\w+)[\s\S]*?)```/gi;
  let match: RegExpExecArray | null;

  while ((match = wgslKeywordsRegex.exec(fullText)) !== null) {
    if (match[1] && match[1].trim().length > 10) {
      return match[1].trim();
    }
  }

  // Pattern 2: Generic code blocks with characteristic WGSL shader statements
  const genericCodeBlockRegex = /```(?:wgsl|shader|glsl|hlsl|c|cpp|ts|js)?\s*([\s\S]*?)```/gi;
  let blockMatch: RegExpExecArray | null;
  while ((blockMatch = genericCodeBlockRegex.exec(fullText)) !== null) {
    const candidate = blockMatch[1] || '';
    if (
      candidate.includes('vec2f') ||
      candidate.includes('vec4f') ||
      candidate.includes('textureSample') ||
      candidate.includes('params.time') ||
      candidate.includes('sceneTexture') ||
      candidate.includes('@fragment')
    ) {
      return candidate.trim();
    }
  }

  return '';
}

export function parseAIActionsAndCleanText(fullText: string): { cleanedText: string; actions: AIAction[] } {
  if (!fullText) return { cleanedText: '', actions: [] };

  const actions: AIAction[] = [];
  let cleanedText = fullText;

  // Process all occurrences of ACTION_TRIGGER
  const triggerRegex = /ACTION_?TRIGGER/gi;
  let match: RegExpExecArray | null;

  // Keep track of ranges to strip out of text
  const textRangesToRemove: { start: number; end: number }[] = [];

  while ((match = triggerRegex.exec(fullText)) !== null) {
    const triggerStart = match.index;
    const jsonExtraction = extractJsonAfterActionTrigger(fullText, triggerStart);

    if (jsonExtraction) {
      const parsedObj = parseCandidateObject(jsonExtraction.jsonStr);
      if (parsedObj && typeof parsedObj === 'object') {
        actions.push(parsedObj);

        // Find range to remove (include optional leading/trailing backticks or markdown wrapper)
        let removeStart = triggerStart;
        let removeEnd = jsonExtraction.endIndex;

        // Check if preceding text has ``` or ```json
        const before = fullText.substring(Math.max(0, triggerStart - 10), triggerStart);
        if (before.includes('```')) {
          removeStart = fullText.lastIndexOf('```', triggerStart);
        }

        // Check if trailing text has closing ```
        const after = fullText.substring(removeEnd, Math.min(fullText.length, removeEnd + 10));
        if (after.startsWith('```')) {
          removeEnd += 3;
        }

        textRangesToRemove.push({ start: removeStart, end: removeEnd });
      }
    }
  }

  // Strip extracted ACTION_TRIGGER blocks from cleanedText
  if (textRangesToRemove.length > 0) {
    // Sort ranges backwards to remove without messing up indices
    textRangesToRemove.sort((a, b) => b.start - a.start);
    for (const r of textRangesToRemove) {
      cleanedText = cleanedText.substring(0, r.start) + cleanedText.substring(r.end);
    }
  }

  // Normalize actions and check if custom WGSL shader was requested
  let hasCustomShaderAction = false;
  actions.forEach(a => {
    if (!a || typeof a !== 'object') return;
    const t = (a.type || '').toLowerCase();
    const name = (a.name || a.effect || '').toLowerCase();

    if (
      t === 'set_ai_effect' ||
      t === 'customshader' ||
      t === 'wgslshader' ||
      (t === 'set_setting' && (name.includes('wgsl') || name.includes('shader')))
    ) {
      hasCustomShaderAction = true;

      // Extract alias fields for WGSL code
      if (!a.wgslCode) {
        a.wgslCode = a.wgsl || a.code || a.shader || a.source || a.wgslSource;
      }
      if (!a.effect) {
        a.effect = 'custom';
      }
    }
  });

  // Check if any shader action is missing its WGSL code, or if WGSL code block was present in text
  const extractedWgsl = extractWgslFromText(fullText);

  if (hasCustomShaderAction) {
    actions.forEach(a => {
      const t = (a.type || '').toLowerCase();
      if (
        (t === 'set_ai_effect' || t === 'customshader' || t === 'wgslshader') &&
        (!a.wgslCode || typeof a.wgslCode !== 'string' || a.wgslCode.trim().length === 0)
      ) {
        if (extractedWgsl) {
          a.wgslCode = extractedWgsl;
        }
      }
    });
  } else if (extractedWgsl) {
    // If NO action trigger was parsed, but the LLM provided a WGSL code block in response,
    // automatically generate the action triggers!
    actions.push({
      type: 'set_ai_effect',
      effect: 'custom',
      enabled: true,
      wgslCode: extractedWgsl
    });
    actions.push({
      type: 'open_settings',
      tab: 'ai_effects'
    });
  }

  return { cleanedText: cleanedText.trim(), actions };
}
