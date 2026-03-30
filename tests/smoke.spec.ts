import { test, expect } from "@playwright/test";

test("首页可以正常打开", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/My Knowledge|知识库/);
  await expect(page.getByRole("link", { name: "进入登录页" })).toBeVisible();
});

test("登录页可以正常打开", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "现在可以直接注册、登录，并进入仪表盘" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "登录并进入仪表盘" })).toBeVisible();
  await expect(page.getByRole("button", { name: "创建账号" })).toBeVisible();
});

test("需求文档页可以正常打开", async ({ page }) => {
  await page.goto("/docs/product-requirements");
  await expect(page.getByRole("heading", { name: /最小可用版本|需求概览/ })).toBeVisible();
});

test("公开内容页可以正常打开", async ({ page }) => {
  await page.goto("/public");
  await expect(page.getByRole("heading", { name: "浏览公开分享的知识卡片" })).toBeVisible();
});

test("未登录访问仪表盘时会进入受控页面", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard|\/login/);
  await expect(
    page.getByRole("heading", { name: /欢迎回来|现在可以直接注册、登录，并进入仪表盘/ }),
  ).toBeVisible();
});
