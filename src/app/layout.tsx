import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "My Knowledge",
    template: "%s | My Knowledge",
  },
  description: "一个用于学习全栈开发、真实部署和持续迭代流程的个人知识库项目。",
  applicationName: "My Knowledge",
  keywords: ["Next.js", "Supabase", "Prisma", "PostgreSQL", "知识库", "全栈学习"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
