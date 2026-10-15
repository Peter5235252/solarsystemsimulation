import React, { useState } from 'react';
import { MousePointerClick, GitCompareArrows, ListOrdered, ChevronLeft, ChevronRight, Crosshair } from 'lucide-react';

/**
 * Intelligent UI blocks for the Stellar Historian Research Dialogue.
 * Inspired by GPT-6's Intelligent UI (Oct 2026): the model composes answers
 * from text plus tappable, interactive elements — used only when they add
 * value, plain text otherwise. Rendered in the app's own frosted-glass
 * design language with frameless icons.
 *
 * Wire format (fenced, JSON payload):
 *   :::ui-actions
 *   [{"label":"Focus Saturn","action":{"type":"select_planet","id":"saturn"}}]
 *   :::
 *   :::ui-compare
 *   {"left":"earth","right":"mars"}
 *   :::
 *   :::ui-steps
 *   {"title":"...","steps":[{"title":"...","text":"..."}]}
 *   :::
 */

export interface UiActionItem {
  label: string;
  action: Record<string, any>;
  hint?: string;
}

export interface UiStepsData {
  title?: string;
  steps: Array<{ title?: string; text: string }>;
}

export type IntelligentBlock =
  | { kind: 'actions'; items: UiActionItem[] }
  | { kind: 'compare'; left: string; right: string }
  | { kind: 'steps'; data: UiStepsData };

export interface BodyCardData {
  id: string;
  name: string;
  type: string;
  mass?: string;
  gravity?: string;
  temp?: string;
  funFact?: string;
}

const BLOCK_RE =
  /:::ui-(actions|compare|steps)\s*\n([\s\S]*?)\n:::/g;

function tryParseJson(payload: string): any | undefined {
  const trimmed = payload.trim();
  // Tolerate a wrapping code fence the model may add.
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  try {
    return JSON.parse(unfenced);
  } catch {
    return undefined;
  }
}

function toActionItems(parsed: any): UiActionItem[] | undefined {
  const arr = Array.isArray(parsed) ? parsed : parsed?.items;
  if (!Array.isArray(arr)) return undefined;
  const items: UiActionItem[] = [];
  for (const entry of arr.slice(0, 6)) {
    if (
      entry &&
      typeof entry.label === 'string' &&
      entry.action &&
      typeof entry.action.type === 'string'
    ) {
      items.push({
        label: entry.label.slice(0, 80),
        action: entry.action,
        hint: typeof entry.hint === 'string' ? entry.hint.slice(0, 140) : undefined,
      });
    }
  }
  return items.length > 0 ? items : undefined;
}

export function parseIntelligentBlocks(text: string): {
  cleaned: string;
  blocks: IntelligentBlock[];
} {
  const blocks: IntelligentBlock[] = [];
  const cleaned = text.replace(BLOCK_RE, (_match, kind: string, payload: string) => {
    const parsed = tryParseJson(payload);
    if (parsed === undefined) return _match; // leave unparseable text intact
    if (kind === 'actions') {
      const items = toActionItems(parsed);
      if (items) blocks.push({ kind: 'actions', items });
      else return _match;
    } else if (kind === 'compare') {
      if (
        typeof parsed?.left === 'string' &&
        typeof parsed?.right === 'string'
      ) {
        blocks.push({ kind: 'compare', left: parsed.left, right: parsed.right });
      } else return _match;
    } else if (kind === 'steps') {
      const steps = Array.isArray(parsed?.steps) ? parsed.steps : undefined;
      if (
        steps &&
        steps.length > 0 &&
        steps.every((s: any) => s && typeof s.text === 'string')
      ) {
        blocks.push({
          kind: 'steps',
          data: {
            title: typeof parsed.title === 'string' ? parsed.title : undefined,
            steps: steps.slice(0, 12).map((s: any) => ({
              title: typeof s.title === 'string' ? s.title.slice(0, 80) : undefined,
              text: String(s.text).slice(0, 600),
            })),
          },
        });
      } else return _match;
    }
    return '';
  });
  return { cleaned, blocks };
}

/** Remove successfully-parsed blocks (used for the live streaming preview). */
export function stripIntelligentBlocks(text: string): string {
  return parseIntelligentBlocks(text).cleaned;
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono font-semibold uppercase tracking-wider">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function BodyStatCard({ body }: { body: BodyCardData }) {
  return (
    <div className="flex-1 min-w-0 rounded-xl bg-slate-950/60 border border-white/10 p-3">
      <div className="text-sm font-semibold text-slate-100 truncate">{body.name}</div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">{body.type}</div>
      <div className="space-y-1 text-[11px] font-light text-slate-300">
        {body.mass && (
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Mass</span>
            <span className="text-right">{body.mass}</span>
          </div>
        )}
        {body.gravity && (
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Gravity</span>
            <span className="text-right">{body.gravity}</span>
          </div>
        )}
        {body.temp && (
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Temp</span>
            <span className="text-right">{body.temp}</span>
          </div>
        )}
      </div>
      {body.funFact && (
        <p className="mt-2 text-[11px] font-light italic text-slate-400 leading-relaxed">{body.funFact}</p>
      )}
    </div>
  );
}

function StepsBlock({ data }: { data: UiStepsData }) {
  const [index, setIndex] = useState(0);
  const total = data.steps.length;
  const step = data.steps[Math.min(index, total - 1)];
  return (
    <div className="rounded-xl bg-slate-950/60 border border-white/10 p-3.5">
      <div className="flex items-center justify-between gap-2 mb-2">
        <SectionLabel icon={<ListOrdered className="w-3.5 h-3.5" />} text={data.title || 'Step by step'} />
        <span className="text-[10px] font-mono text-slate-500">
          {Math.min(index, total - 1) + 1} / {total}
        </span>
      </div>
      {step.title && (
        <div className="text-[13px] font-semibold text-slate-100 mb-1">{step.title}</div>
      )}
      <p className="text-[12.5px] font-light text-slate-300 leading-relaxed">{step.text}</p>
      {total > 1 && (
        <div className="flex items-center justify-between mt-3">
          <button
            type="button"
            onClick={() => setIndex(i => Math.max(0, i - 1))}
            disabled={index === 0}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          <div className="flex items-center gap-1">
            {data.steps.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? 'bg-slate-200' : 'bg-slate-700'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIndex(i => Math.min(total - 1, i + 1))}
            disabled={index >= total - 1}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export function IntelligentBlockView({
  blocks,
  onRunAction,
  resolveBody,
}: {
  blocks: IntelligentBlock[];
  onRunAction: (label: string, action: Record<string, any>) => void;
  resolveBody?: (id: string) => BodyCardData | undefined;
}) {
  if (blocks.length === 0) return null;
  return (
    <div className="mt-3 flex flex-col gap-2.5">
      {blocks.map((block, bi) => {
        if (block.kind === 'actions') {
          return (
            <div key={bi} className="rounded-xl bg-slate-950/60 border border-white/10 p-3">
              <div className="mb-2">
                <SectionLabel icon={<MousePointerClick className="w-3.5 h-3.5" />} text="Try it in the simulator" />
              </div>
              <div className="flex flex-wrap gap-2">
                {block.items.map((item, ii) => (
                  <button
                    key={ii}
                    type="button"
                    title={item.hint}
                    onClick={() => onRunAction(item.label, item.action)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs font-medium text-slate-200 hover:text-white transition-all active:scale-95"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-slate-400" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          );
        }
        if (block.kind === 'compare') {
          const left = resolveBody?.(block.left);
          const right = resolveBody?.(block.right);
          if (!left || !right) return null;
          return (
            <div key={bi} className="rounded-xl bg-slate-950/60 border border-white/10 p-3">
              <div className="mb-2">
                <SectionLabel icon={<GitCompareArrows className="w-3.5 h-3.5" />} text="Side by side" />
              </div>
              <div className="flex gap-2">
                <BodyStatCard body={left} />
                <BodyStatCard body={right} />
              </div>
            </div>
          );
        }
        return (
          <div key={bi}>
            <StepsBlock data={block.data} />
          </div>
        );
      })}
    </div>
  );
}
