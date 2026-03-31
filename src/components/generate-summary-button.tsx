"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

type GenerateSummaryButtonProps = {
  canUseAi: boolean;
  formAction: ComponentProps<"button">["formAction"];
};

export function GenerateSummaryButton({ canUseAi, formAction }: GenerateSummaryButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      formAction={formAction}
      formNoValidate
      className="button-primary bg-accent hover:bg-accent-strong rounded-full px-5 py-3 text-sm font-medium !text-white disabled:cursor-not-allowed disabled:opacity-70"
      disabled={!canUseAi || pending}
    >
      {!canUseAi ? "AI 尚未配置" : pending ? "正在生成摘要..." : "AI 生成摘要"}
    </button>
  );
}
