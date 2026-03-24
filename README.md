# My Knowledge

个人知识库 / 收藏夹系统。

当前仓库用于从零实践一套完整的全栈开发与上线流程，技术路线为：

- Next.js
- Tailwind CSS
- PostgreSQL
- Prisma
- Supabase Auth / Storage
- Vercel

## 当前目录说明

- `docs/`: 需求文档、规划文档、部署文档
- `src/`: 应用源码
- `prisma/`: 数据库 schema 与 migration
- `public/`: 静态资源
- `scripts/`: 项目脚本
- `tests/`: 测试代码

## 本地开发

1. 安装依赖：`npm install`
2. 复制环境变量：把 `.env.example` 改成 `.env.local`
3. 填写 Supabase 和数据库配置
4. 运行开发环境：`npm run dev`
5. 打开 `http://localhost:3000`

## 常用命令

- `npm run dev`
- `npm run lint`
- `npm run build`
- `npx prisma generate`
- `npx prisma db push`

## 当前功能

- 用户注册、登录、退出
- 新建 Note
- Note 列表
- 编辑 Note
- 删除 Note
- Note 搜索
- 标签筛选

## 部署准备

部署前先看这两份文档：

- `docs/deployment-checklist.md`
- `docs/deployment-guide.md`

建议上线前至少执行：

1. `npm run lint`
2. `npm run build`
3. 本地完整走一遍登录与 CRUD

## 当前状态

项目已经具备真实登录、数据库读写和基础产品体验，下一步可以继续补：

1. 更细的交互反馈
2. 图片上传
3. 域名和 Vercel 正式上线
