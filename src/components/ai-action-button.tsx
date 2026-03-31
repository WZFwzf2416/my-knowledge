"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type AiActionButtonProps = {
  canUseAi: boolean;
  formAction: ComponentProps<"button">["formAction"];
  idleLabel: string;
  pendingLabel: string;
  disabledLabel?: string;
};

export function AiActionButton({
  canUseAi,
  formAction,
  idleLabel,
  pendingLabel,
  disabledLabel = "AI 尚未配置",
}: AiActionButtonProps) {
  const status = useFormStatus();
  const isOwnActionPending = status.pending && status.action === formAction;

  return (
    <button
      type="submit"
      formAction={formAction}
      formNoValidate
      className="button-primary bg-accent hover:bg-accent-strong min-w-[9.5rem] whitespace-nowrap rounded-full px-5 py-3 text-sm font-medium !text-white disabled:cursor-not-allowed disabled:opacity-70"
      disabled={!canUseAi || isOwnActionPending}
    >
      {!canUseAi ? disabledLabel : isOwnActionPending ? pendingLabel : idleLabel}
    </button>
  );
}
