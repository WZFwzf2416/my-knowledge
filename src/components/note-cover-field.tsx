"use client";

import { useEffect, useMemo, useState } from "react";

type NoteCoverFieldProps = {
  initialCoverUrl: string;
  canUpload: boolean;
};

export function NoteCoverField({ initialCoverUrl, canUpload }: NoteCoverFieldProps) {
  const [coverImageUrl, setCoverImageUrl] = useState(initialCoverUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useManualUrl, setUseManualUrl] = useState(Boolean(initialCoverUrl));

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
    const imageUrl = previewUrl || coverImageUrl;

    if (!imageUrl) {
      return undefined;
    }

    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundPosition: "center",
      backgroundSize: "cover",
    } as const;
  }, [coverImageUrl, previewUrl]);

  return (
    <div className="border-border bg-surface/70 rounded-[1.75rem] border p-5">
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-foreground text-sm font-medium">封面图</p>
            {selectedFile ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                待保存
              </span>
            ) : null}
          </div>
          <p className="text-muted mt-1 text-xs leading-5">
            选择新图片后会先在当前页面预览，点击保存时再由服务端上传到 Storage。
          </p>
        </div>

        <div
          className="border-border bg-background h-44 rounded-[1.5rem] border"
          style={previewStyle}
          aria-label="封面图预览"
        >
          {previewUrl || coverImageUrl ? null : (
            <div className="text-muted flex h-full items-center justify-center text-sm">
              还没有封面图
            </div>
          )}
        </div>

        <input
          type="file"
          name="coverImageFile"
          accept="image/*"
          disabled={!canUpload}
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          className="text-muted file:bg-accent/10 file:text-accent hover:file:bg-accent/20 block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="text-muted flex flex-wrap items-center gap-3 text-xs leading-5">
          <span>
            {canUpload
              ? selectedFile
                ? `已选择文件：${selectedFile.name}`
                : "还没有选择新封面图。"
              : "当前未检测到 Supabase 环境变量，文件上传会被禁用。"}
          </span>
          {selectedFile ? (
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="text-accent hover:text-accent-strong font-medium"
            >
              取消本次选择
            </button>
          ) : null}
        </div>
      </div>

      <div className="border-border bg-background/70 mt-5 rounded-2xl border border-dashed p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-foreground text-sm font-medium">备用方式</p>
            <p className="text-muted mt-1 text-xs leading-5">
              如果你已经有在线图片地址，也可以直接粘贴链接作为封面图。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUseManualUrl((value) => !value)}
            className="text-accent hover:text-accent-strong text-sm font-medium"
          >
            {useManualUrl ? "收起" : "使用链接"}
          </button>
        </div>

        {useManualUrl ? (
          <label className="text-muted mt-4 block text-sm">
            封面图链接
            <input
              type="url"
              name="coverImageUrl"
              value={coverImageUrl}
              onChange={(event) => setCoverImageUrl(event.target.value)}
              placeholder="https://example.com/cover.png"
              className="border-border bg-background text-foreground focus:border-accent mt-2 w-full rounded-2xl border px-4 py-3 transition-colors outline-none"
            />
          </label>
        ) : (
          <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
        )}
      </div>
    </div>
  );
}
