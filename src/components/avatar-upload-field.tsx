"use client";

import { useEffect, useMemo, useState } from "react";

type AvatarUploadFieldProps = {
  initialAvatarUrl: string;
  canUpload: boolean;
  fallbackLabel: string;
};

export function AvatarUploadField({
  initialAvatarUrl,
  canUpload,
  fallbackLabel,
}: AvatarUploadFieldProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useManualUrl, setUseManualUrl] = useState(Boolean(initialAvatarUrl));

  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return "";
    }

    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const previewStyle = useMemo(() => {
    const imageUrl = previewUrl || avatarUrl;

    if (!imageUrl) {
      return undefined;
    }

    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundPosition: "center",
      backgroundSize: "cover",
    } as const;
  }, [avatarUrl, previewUrl]);

  return (
    <div className="rounded-[1.75rem] border border-border bg-surface/70 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-2xl font-semibold text-white"
          style={previewStyle}
          aria-label="头像预览"
        >
          {previewUrl || avatarUrl ? <span className="sr-only">头像预览</span> : fallbackLabel}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">头像设置</p>
            {selectedFile ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                待保存
              </span>
            ) : null}
          </div>

          <p className="text-xs leading-5 text-muted">
            选择图片后会先在当前页面预览，点击下方“保存个人资料”时才会真正上传并写入数据库。
          </p>

          <input
            type="file"
            name="avatarFile"
            accept="image/*"
            disabled={!canUpload}
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-accent/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent hover:file:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <div className="flex flex-wrap items-center gap-3 text-xs leading-5 text-muted">
            <span>
              {canUpload
                ? selectedFile
                  ? `已选择文件：${selectedFile.name}`
                  : "还没有选择新头像。"
                : "当前未检测到 Supabase 环境变量，文件上传会被禁用。"}
            </span>
            {selectedFile ? (
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="font-medium text-accent hover:text-accent-strong"
              >
                取消本次选择
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">备用方式</p>
            <p className="mt-1 text-xs leading-5 text-muted">如果你已经有在线图片地址，也可以直接粘贴链接作为头像。</p>
          </div>
          <button
            type="button"
            onClick={() => setUseManualUrl((value) => !value)}
            className="text-sm font-medium text-accent hover:text-accent-strong"
          >
            {useManualUrl ? "收起" : "使用链接"}
          </button>
        </div>

        {useManualUrl ? (
          <label className="mt-4 block text-sm text-muted">
            头像链接
            <input
              type="url"
              name="avatarUrl"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://example.com/avatar.png"
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
            />
          </label>
        ) : (
          <input type="hidden" name="avatarUrl" value={avatarUrl} />
        )}
      </div>
    </div>
  );
}
