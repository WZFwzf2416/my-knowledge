import type { Metadata } from "next";
import { env } from "@/lib/env";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: {
    default: "知识库",
    template: "%s | My Knowledge",
  },
  description: "一个用于学习全栈开发、真实部署和持续迭代流程的个人知识库项目。",
  applicationName: "My Knowledge",
  keywords: ["Next.js", "Supabase", "Prisma", "PostgreSQL", "知识库", "全栈学习"],
  openGraph: {
    title: "知识库 | My Knowledge",
    description: "一个用于学习全栈开发、真实部署和持续迭代流程的个人知识库项目。",
    type: "website",
    siteName: "My Knowledge",
  },
  twitter: {
    card: "summary_large_image",
    title: "知识库 | My Knowledge",
    description: "一个用于学习全栈开发、真实部署和持续迭代流程的个人知识库项目。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
