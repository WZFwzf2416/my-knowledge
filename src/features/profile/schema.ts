import { z } from "zod";

export const profileSchema = z.object({
  nickname: z.string().trim().max(30, "昵称不能超过 30 个字符。"),
  bio: z.string().trim().max(160, "简介不能超过 160 个字符。"),
  avatarUrl: z
    .string()
    .trim()
    .max(500, "头像地址太长了。")
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^https?:\/\//.test(value), "头像地址需要是 http 或 https 链接。"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
