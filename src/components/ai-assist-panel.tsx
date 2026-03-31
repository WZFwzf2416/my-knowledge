"use client";

import type { ComponentProps, ReactNode } from "react";
import { AiActionButton } from "@/components/ai-action-button";

type Tone = "violet" | "emerald" | "sky";
type IconName = "title" | "summary" | "tags";

type AiAssistPanelProps = {
  title: string;
  description: string;
  canUseAi: boolean;
  formAction: ComponentProps<"button">["formAction"];
  idleLabel: string;
  pendingLabel: string;
  icon: IconName;
  tone: Tone;
  successHint?: ReactNode;
  actionSlot?: ReactNode;
};

const toneMap: Record<Tone, { shell: string; badge: string; accent: string }> = {
  violet: {
    shell: "border-violet-200/80 bg-violet-50/40",
    badge: "bg-violet-100 text-violet-700 ring-violet-200/80",
    accent: "bg-violet-500/70",
  },
  emerald: {
    shell: "border-emerald-200/80 bg-emerald-50/40",
    badge: "bg-emerald-100 text-emerald-700 ring-emerald-200/80",
    accent: "bg-emerald-500/70",
  },
  sky: {
    shell: "border-sky-200/80 bg-sky-50/40",
    badge: "bg-sky-100 text-sky-700 ring-sky-200/80",
    accent: "bg-sky-500/70",
  },
};

function PanelIcon({ icon }: { icon: IconName }) {
  if (icon === "title") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <path
          d="M5 7h14M8 7v10m8-10v10M5 17h14"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (icon === "summary") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <path
          d="M6 7h12M6 12h12M6 17h8"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M7 8h6l4 4-6 6-4-4V8Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="10" cy="11" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function AiAssistPanel({
  title,
  description,
  canUseAi,
  formAction,
  idleLabel,
  pendingLabel,
  icon,
  tone,
  successHint,
  actionSlot,
}: AiAssistPanelProps) {
  const styles = toneMap[tone];

  return (
    <div className={`mt-3 overflow-hidden rounded-2xl border border-dashed px-4 py-4 text-sm ${styles.shell}`}>
      <div className={`mb-4 h-1.5 w-16 rounded-full ${styles.accent}`} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full ring-1 ${styles.badge}`}
            >
              <PanelIcon icon={icon} />
            </span>
            <p className="text-foreground font-medium">{title}</p>
          </div>
          <p className="text-muted mt-2 leading-6">{description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actionSlot}
          <AiActionButton
            canUseAi={canUseAi}
            formAction={formAction}
            idleLabel={idleLabel}
            pendingLabel={pendingLabel}
          />
        </div>
      </div>

      {successHint ? <div className="mt-3">{successHint}</div> : null}
    </div>
  );
}