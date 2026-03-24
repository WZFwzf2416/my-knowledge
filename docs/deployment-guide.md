# 部署指南

## 目标

把 `My Knowledge` 从本地开发环境部署到 Vercel，并保证以下能力在线上可正常工作：

- 首页访问
- 登录 / 注册 / 退出
- 仪表盘访问
- Note 创建、编辑、删除
- 搜索和标签筛选
- 刷新后登录状态保持

---

## 当前技术栈

- 应用框架：Next.js
- 鉴权：Supabase Auth
- 数据库：Supabase PostgreSQL
- ORM：Prisma
- 部署平台：Vercel

---

## 部署前准备

### 1. 本地功能检查

上线前先在本地确认：

1. `npm run lint` 可以通过
2. `npm run build` 可以通过
3. `/login` 可以注册或登录
4. `/dashboard` 可以加载数据
5. 可以创建、编辑、删除 Note
6. 搜索和标签筛选可用

### 2. 数据库表已同步

确认当前数据库已经同步过 Prisma schema：

```bash
npx prisma db push
```

如果你本地的 `DATABASE_URL` 在 `.env.local`，先确保命令能读到正确环境变量。

---

## 环境变量说明

线上 Vercel 需要配置以下变量：

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

### 推荐写法

#### `NEXT_PUBLIC_SUPABASE_URL`

```txt
https://your-project-ref.supabase.co
```

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

填写 Supabase 项目的匿名公钥。

#### `NEXT_PUBLIC_APP_URL`

线上应写成你的真实访问地址，例如：

```txt
https://your-project.vercel.app
```

如果之后绑定自定义域名，再改成自定义域名。

#### `DATABASE_URL`

优先建议使用 Supabase Dashboard 中适合 Prisma 的稳定连接串。

实际经验里：

- 本地或长期运行环境，优先使用更稳定的连接方式
- 如果 direct connection 偶发报 `Connection terminated unexpectedly`
- 优先切换到 Supabase 提供的 pooler / session 模式连接串

不要盲目沿用老教程里的旧连接写法。

---

## Vercel 部署步骤

### 第 1 步：推送代码

把当前项目推送到 GitHub、GitLab 或 Bitbucket。

### 第 2 步：导入项目

1. 打开 Vercel
2. 选择 `Add New -> Project`
3. 导入你的仓库
4. Framework 识别为 Next.js 即可

### 第 3 步：配置环境变量

在 Vercel 的项目设置中添加：

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

建议：

- Preview 和 Production 都配齐
- 不要只配 Production，否则预览环境会行为不一致

### 第 4 步：首次部署

保存环境变量后执行首次部署。

### 第 5 步：上线后验证

部署完成后，依次验证：

1. 首页能正常打开
2. `/login` 能访问
3. 能注册或登录
4. 登录后能进入 `/dashboard`
5. 能创建一条 Note
6. 能进入详情页编辑
7. 能删除 Note
8. 刷新后登录状态仍在

---

## Supabase 需要同步配置的地方

### 1. Authentication URL Configuration

在 Supabase Dashboard 中：

`Authentication -> URL Configuration`

确认这些地址已配置：

- Site URL：你的 Vercel 正式域名
- 允许的 Redirect URLs：你的 Vercel 域名

如果用了 Preview 部署，也建议把 Preview 域名模式补进去。

### 2. 匿名公钥

确认 Vercel 中的：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

来自同一个 Supabase 项目，不要混项目。

### 3. 数据库连接串

确认 Vercel 中的 `DATABASE_URL` 是可在当前环境稳定连接的版本。

如果线上出现：

- `Connection terminated unexpectedly`
- Prisma 读写偶发失败

优先检查连接串是否需要从 direct connection 切到 pooler。

---

## 推荐部署顺序

建议按下面顺序上：

1. 先用 `vercel.app` 默认域名部署成功
2. 验证登录和 CRUD 都正常
3. 再绑定自定义域名
4. 再修改 `NEXT_PUBLIC_APP_URL`
5. 再同步更新 Supabase 的 URL 配置

这样更容易排查问题，不会把“部署问题”和“域名问题”混在一起。

---

## 常见问题排查

### 1. 登录页打开报错

优先检查：

- Supabase server client 是否在页面渲染里错误写 cookie
- 是否把页面用 client 和 action 用 client 混用了

### 2. 本地能连库，线上不能

优先检查：

- `DATABASE_URL` 是否漏填
- 线上是不是还在用旧连接串
- Supabase 是否限制了连接方式

### 3. 登录成功但跳不回仪表盘

优先检查：

- `NEXT_PUBLIC_APP_URL`
- Supabase `URL Configuration`
- 线上域名是否已经加入允许列表

### 4. 页面空白或 Note 列表没有数据

优先检查：

- 当前用户是否真的登录
- `users` 表是否已同步
- Prisma schema 是否已经 push 到线上数据库

### 5. Preview 正常，Production 不正常

优先检查：

- Production 环境变量是否单独漏配
- Supabase 是否只配置了某一个域名

---

## 上线后建议立即做的事

1. 把真实线上地址补进 README
2. 记录第一次上线遇到的问题
3. 保存一份最终可用的环境变量模板
4. 给自己做一份发布 checklist

---

## 推荐上线前最终命令

```bash
npm run lint
npm run build
```

如果这两条不过，不建议直接上线。
