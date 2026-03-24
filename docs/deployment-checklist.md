# 部署检查清单

## 目标

把当前项目稳定部署到 Vercel，并确保 Supabase 登录、数据库读写和页面访问都正常。

## 上线前本地检查

1. 执行 `npm run lint`
2. 执行 `npm run build`
3. 确认可以本地登录、创建 Note、编辑 Note、删除 Note
4. 确认 `/dashboard` 搜索和标签筛选可用
5. 确认 `.env.local` 中环境变量完整

## Vercel 需要配置的环境变量

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

说明：

- `NEXT_PUBLIC_APP_URL` 在线上应改为你的正式域名，例如 `https://your-app.vercel.app`
- `DATABASE_URL` 建议使用 Supabase Dashboard 中适合 Prisma 的稳定连接串

## Supabase 侧检查

### Authentication

1. 打开 Supabase Dashboard
2. 进入 `Authentication -> URL Configuration`
3. 增加站点地址：你的线上域名
4. 如果需要回调地址，也把对应的 Vercel 域名加入允许列表

### Database

1. 确认 `users`、`notes`、`tags`、`note_tags` 四张表已经存在
2. 确认数据库用户有读写权限
3. 如果后续要做 Row Level Security，再单独补权限策略

## Vercel 部署步骤

1. 把仓库推到 Git 平台
2. 在 Vercel 导入项目
3. 设置 Framework 为 Next.js
4. 添加所有环境变量
5. 首次部署
6. 打开线上地址测试登录和 CRUD

## 上线后验证

1. 首页能打开
2. `/login` 能正常注册和登录
3. `/dashboard` 能正常展示数据
4. 新建 Note 后列表立即可见
5. 编辑和删除都能成功
6. 搜索和标签筛选可用
7. 刷新页面不会丢失登录状态

## 常见问题

### 数据库连接失败

优先检查：

- `DATABASE_URL` 是否正确
- 是否使用了适合当前运行环境的 Supabase 连接串
- Vercel 环境变量是否漏填

### 登录后跳转异常

优先检查：

- Supabase `URL Configuration`
- `NEXT_PUBLIC_APP_URL`
- 站点域名是否和 Supabase 配置一致

### 本地可以，线上不行

优先检查：

- 线上环境变量和 `.env.local` 是否一致
- 是否重新部署过最新代码
- Supabase 是否允许线上域名访问
