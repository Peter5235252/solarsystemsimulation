export interface AIAction {
  type: string;
  [key: string]: any;
}

const VALID_ACTION_TYPES = new Set([
  'select_planet',
  'reset_camera',
  'set_zoom',
  'set_speed',
  'pause',
  'resume',
  'toggle_pause',
  'time_travel',
  'set_setting',
  'apply_preset',
  'set_audio',
  'open_settings',
  'close_settings',
  'open_search',
  'batch'
]);

/**
 * Normalizes raw LLM action objects, maps aliases, and filters out hallucinated nonexistent actions.
 */
export function normalizeAction(rawAction: any): AIAction | null {
  if (!rawAction || typeof rawAction !== 'object') return null;

  let type = String(rawAction.type || rawAction.action || rawAction.command || '').toLowerCase().trim().replace(/_/g, '');

  if (!type) return null;

  // Type Aliasing & Mapping
  if (['selectplanet', 'selectbody', 'focusplanet', 'focusbody', 'focus', 'travel', 'target', 'goto', 'planet', 'select', 'flyto', 'lockplanet', 'lock'].includes(type)) {
    type = 'select_planet';
  } else if (['resetcamera', 'reset', 'overview', 'solarsystemview', 'home', 'resetsystem', 'resetview'].includes(type)) {
    type = 'reset_camera';
  } else if (['setzoom', 'zoom', 'camerazoom'].includes(type)) {
    type = 'set_zoom';
  } else if (['setspeed', 'speed', 'speedmultiplier', 'orbitspeed', 'changespeed', 'warpspeed', 'timeMultiplier'].includes(type)) {
    type = 'set_speed';
  } else if (['pause', 'pausesimulation', 'freeze', 'stop'].includes(type)) {
    type = 'pause';
  } else if (['resume', 'unpause', 'resumesimulation', 'play', 'start'].includes(type)) {
    type = 'resume';
  } else if (['togglepause', 'toggleplay'].includes(type)) {
    type = 'toggle_pause';
  } else if (['timetravel', 'settimeevent', 'timeevent', 'warpevent', 'historicevent', 'event', 'jump'].includes(type)) {
    type = 'time_travel';
  } else if (['setsetting', 'modifysetting', 'changesetting', 'togglesetting', 'setting'].includes(type)) {
    type = 'set_setting';
  } else if (['applypreset', 'setpreset', 'graphicspreset', 'setgraphics', 'preset', 'quality'].includes(type)) {
    type = 'apply_preset';
  } else if (['setaudio', 'audiocontrol', 'volume', 'sound', 'mute'].includes(type)) {
    type = 'set_audio';
  } else if (['opensettings', 'settings'].includes(type)) {
    type = 'open_settings';
  } else if (['closesettings'].includes(type)) {
    type = 'close_settings';
  } else if (['opensearch', 'search'].includes(type)) {
    type = 'open_search';
  } else if (['batch', 'multiaction', 'sequence'].includes(type)) {
    type = 'batch';
  }

  // Reject hallucinated non-existent action types
  if (!VALID_ACTION_TYPES.has(type)) {
    return null;
  }

  const cleanAction: AIAction = { ...rawAction, type };

  // Attribute Normalization
  if (type === 'select_planet') {
    if (!cleanAction.id && (cleanAction.target || cleanAction.planet || cleanAction.body || cleanAction.name || cleanAction.bodyId)) {
      cleanAction.id = cleanAction.target || cleanAction.planet || cleanAction.body || cleanAction.name || cleanAction.bodyId;
    }
  } else if (type === 'set_speed') {
    if (cleanAction.value === undefined && (cleanAction.speed !== undefined || cleanAction.multiplier !== undefined)) {
      cleanAction.value = cleanAction.speed ?? cleanAction.multiplier;
    }
  } else if (type === 'time_travel') {
    if (!cleanAction.id && (cleanAction.event || cleanAction.eventId || cleanAction.value)) {
      cleanAction.id = cleanAction.event || cleanAction.eventId || cleanAction.value;
    }
  } else if (type === 'apply_preset') {
    if (!cleanAction.preset && (cleanAction.value || cleanAction.quality)) {
      cleanAction.preset = cleanAction.value || cleanAction.quality;
    }
  } else if (type === 'set_setting') {
    if (cleanAction.name) {
      let n = String(cleanAction.name).toLowerCase().replace(/_/g, '');
      if (n === 'showorbits' || n === 'orbits') cleanAction.name = 'showOrbits';
      else if (n === 'showlabels' || n === 'labels') cleanAction.name = 'showLabels';
      else if (n === 'showasteroids' || n === 'asteroids') cleanAction.name = 'showAsteroids';
      else if (n === 'showconstellations' || n === 'constellations') cleanAction.name = 'showConstellations';
      else if (n === 'showspacecraft' || n === 'spacecraft') cleanAction.name = 'showSpacecraft';
      else if (n === 'perfmode' || n === 'performance') cleanAction.name = 'perfMode';
      else if (n === 'hdmode' || n === 'hd') cleanAction.name = 'hdMode';
      else if (n === 'tempunit' || n === 'temperature') cleanAction.name = 'tempUnit';
      else if (n === 'resscale' || n === 'fsr') cleanAction.name = 'resScale';
      else if (n === 'graphicspreset' || n === 'preset') cleanAction.name = 'graphicsPreset';
      else if (n === 'enablebloom' || n === 'bloom') cleanAction.name = 'enableBloom';
      else if (n === 'enablechromatic' || n === 'chromatic') cleanAction.name = 'enableChromatic';
      else if (n === 'enablelensflare' || n === 'lensflare') cleanAction.name = 'enableLensFlare';
      else if (n === 'enablecosmicdust' || n === 'cosmicdust') cleanAction.name = 'enableCosmicDust';
      else if (n === 'enablevignette' || n === 'vignette') cleanAction.name = 'enableVignette';
      else if (n === 'fpscap' || n === 'fps' || n === 'framerate' || n === 'frameratecap' || n === 'maxfps') cleanAction.name = 'fpsCap';
      else if (n === 'wasdspeed' || n === 'cameraspeed' || n === 'movespeed') cleanAction.name = 'wasdSpeed';
    }
  } else if (type === 'batch') {
    if (Array.isArray(cleanAction.actions)) {
      cleanAction.actions = cleanAction.actions
        .map((a: any) => normalizeAction(a))
        .filter((a: any): a is AIAction => a !== null);
    }
  }

  return cleanAction;
}

/**
 * Returns a human-readable title and details for the Action Dispatched UI badge.
 */
export function getDispatchedActionInfo(act: AIAction): { label: string; details: string } {
  if (!act || !act.type) return { label: 'Action', details: 'Executed' };

  switch (act.type) {
    case 'select_planet': {
      const rawId = act.id || act.bodyId || act.target || act.planet || act.name;
      if (!rawId || rawId === 'null' || rawId === 'none' || rawId === 'deselect' || rawId === 'reset') {
        return { label: 'Camera Target', details: 'Solar System Overview' };
      }
      return { label: 'Camera Target', details: `Focus: ${String(rawId).toUpperCase().replace(/_/g, ' ')}` };
    }
    case 'reset_camera':
      return { label: 'Camera Reset', details: 'Solar System Overview' };
    case 'set_zoom': {
      const val = act.value ?? act.zoom ?? act.level;
      if (val === 'in' || val === 'zoomin') return { label: 'Camera Zoom', details: 'Zoom In' };
      if (val === 'out' || val === 'zoomout') return { label: 'Camera Zoom', details: 'Zoom Out' };
      return { label: 'Camera Zoom', details: `Level: ${val}x` };
    }
    case 'set_speed': {
      const spd = act.value ?? act.speed ?? act.multiplier ?? 1;
      return { label: 'Orbit Speed', details: `Multiplier: ${spd}x` };
    }
    case 'pause':
      return { label: 'Simulation State', details: 'Paused' };
    case 'resume':
      return { label: 'Simulation State', details: 'Resumed' };
    case 'toggle_pause':
      return { label: 'Simulation State', details: 'Play/Pause Toggled' };
    case 'time_travel': {
      const evtId = String(act.id || act.event || '').toLowerCase();
      const eventNames: Record<string, string> = {
        apollo11: 'Apollo 11 Landing (1969)',
        voyager1: 'Voyager 1 Launch (1977)',
        halley1986: "Halley's Comet (1986)",
        alignment2000: 'Grand Alignment (2000)',
        jwst2021: 'JWST Deployment (2021)',
        alignment2040: 'Future Alignment (2040)'
      };
      const name = eventNames[evtId] || evtId.toUpperCase();
      return { label: 'Time Travel Event', details: name };
    }
    case 'set_setting': {
      const name = act.name || 'Setting';
      const val = act.value !== undefined ? String(act.value) : '';
      return { label: 'Simulator Setting', details: `${name} = ${val}` };
    }
    case 'apply_preset': {
      const preset = String(act.preset || act.value || 'Custom').toUpperCase();
      return { label: 'Graphics Preset', details: preset };
    }
    case 'set_audio': {
      if (act.mute) return { label: 'Audio', details: 'Muted' };
      const amb = act.ambienceVolume ?? act.musicVolume;
      const tap = act.tapVolume ?? act.soundVolume;
      const parts: string[] = [];
      if (amb !== undefined) parts.push(`Ambience: ${amb}%`);
      if (tap !== undefined) parts.push(`Effects: ${tap}%`);
      return { label: 'Audio Control', details: parts.length > 0 ? parts.join(', ') : 'Updated' };
    }
    case 'open_settings':
      return { label: 'Settings Panel', details: `Opened (${(act.tab || 'General').toUpperCase()})` };
    case 'close_settings':
      return { label: 'Settings Panel', details: 'Closed' };
    case 'open_search':
      return { label: 'Celestial Search', details: act.query ? `Query: "${act.query}"` : 'Opened' };
    case 'batch': {
      const count = Array.isArray(act.actions) ? act.actions.length : 1;
      return { label: 'Batch Execution', details: `${count} Actions Dispatched` };
    }
    default:
      return { label: 'Action', details: String(act.type) };
  }
}

/**
 * Robustly extracts the top-level JSON substring starting at `{` following `ACTION_TRIGGER`.
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
 * Converts raw unescaped newlines/tabs inside string literals
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

  try {
    return JSON.parse(trimmed);
  } catch {}

  try {
    const sanitized = sanitizeStringLiterals(trimmed);
    return JSON.parse(sanitized);
  } catch {}

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
    try {
      const typeMatch = /"(?:type)"\s*:\s*"([^"]+)"|'type'\s*:\s*'([^']+)'|type\s*:\s*"([^"]+)"/i.exec(trimmed);
      const type = typeMatch ? (typeMatch[1] || typeMatch[2] || typeMatch[3]) : null;

      if (type) {
        const obj: any = { type };
        const idMatch = /"id"\s*:\s*"([^"]+)"|id\s*:\s*"([^"]+)"/i.exec(trimmed);
        if (idMatch) obj.id = idMatch[1] || idMatch[2];

        const valMatch = /"value"\s*:\s*([^,\}\s]+)|value\s*:\s*([^,\}\s]+)/i.exec(trimmed);
        if (valMatch) obj.value = valMatch[1] || valMatch[2];

        return obj;
      }
    } catch {}
  }

  return null;
}

export function parseAIActionsAndCleanText(fullText: string): { cleanedText: string; actions: AIAction[] } {
  if (!fullText) return { cleanedText: '', actions: [] };

  const actions: AIAction[] = [];
  let cleanedText = fullText;

  // Process all occurrences of ACTION_TRIGGER
  const triggerRegex = /ACTION_?TRIGGER/gi;
  let match: RegExpExecArray | null;

  const textRangesToRemove: { start: number; end: number }[] = [];

  while ((match = triggerRegex.exec(fullText)) !== null) {
    const triggerStart = match.index;
    const jsonExtraction = extractJsonAfterActionTrigger(fullText, triggerStart);

    if (jsonExtraction) {
      const parsedObj = parseCandidateObject(jsonExtraction.jsonStr);
      const normalized = normalizeAction(parsedObj);

      if (normalized) {
        actions.push(normalized);

        let removeStart = triggerStart;
        let removeEnd = jsonExtraction.endIndex;

        const before = fullText.substring(Math.max(0, triggerStart - 10), triggerStart);
        if (before.includes('```')) {
          removeStart = fullText.lastIndexOf('```', triggerStart);
        }

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
    textRangesToRemove.sort((a, b) => b.start - a.start);
    for (const r of textRangesToRemove) {
      cleanedText = cleanedText.substring(0, r.start) + cleanedText.substring(r.end);
    }
  }

  // Fallback scanner: If no ACTION_TRIGGER was present, check if the LLM appended a JSON block with "type": ...
  if (actions.length === 0) {
    const jsonBlockRegex = /```(?:json)?\s*(\{\s*"type"\s*:[\s\S]*?\})\s*```|\{\s*"type"\s*:\s*"[^"]+"\s*,\s*[\s\S]*?\}/gi;
    let jsonMatch: RegExpExecArray | null;
    while ((jsonMatch = jsonBlockRegex.exec(cleanedText)) !== null) {
      const candidateStr = jsonMatch[1] || jsonMatch[0];
      const parsedObj = parseCandidateObject(candidateStr);
      const normalized = normalizeAction(parsedObj);

      if (normalized) {
        actions.push(normalized);
        cleanedText = cleanedText.substring(0, jsonMatch.index) + cleanedText.substring(jsonMatch.index + jsonMatch[0].length);
        break;
      }
    }
  }

  return { cleanedText: cleanedText.trim(), actions };
}

