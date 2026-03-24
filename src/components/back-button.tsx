"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  label?: string;
  className?: string;
};

export function BackButton({
  label = "返回上一页",
  className,
}: BackButtonProps) {
  const router = useRouter();

  return (
    <button type="button" onClick={() => router.back()} className={className}>
      {label}
    </button>
  );
}
