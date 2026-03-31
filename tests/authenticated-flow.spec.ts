import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { expect, test, type Page } from "@playwright/test";

dotenv.config({ path: ".env.local" });

type TestCredentials = {
  email: string;
  password: string;
  title: string;
};

function uniqueCredentials(): TestCredentials {
  const seed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    email: `autotest.${seed}@gmail.com`,
    password: `Passw0rd!${seed}`,
    title: `自动化测试 Note ${seed}`,
  };
}

async function createConfirmedUser(email: string, password: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  test.skip(!supabaseUrl || !serviceRoleKey, "缺少 Supabase service role 配置，无法创建测试账号。");

  const admin = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw error;
  }

  return {
    admin,
    userId: data.user.id,
  };
}

async function loginAs(page: Page, creds: TestCredentials) {
  await page.goto("/login");

  const loginForm = page.locator("form").first();

  await loginForm.locator('input[name="email"]').fill(creds.email);
  await loginForm.locator('input[name="password"]').fill(creds.password);
  await loginForm.getByRole("button").first().click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.locator('input[name="title"]').first()).toBeVisible();
  await expect(page.locator('textarea[name="content"]').first()).toBeVisible();
}

async function createNoteFromDashboard(page: Page, title: string) {
  await page.locator('input[name="title"]').first().fill(title);
  await page.locator('textarea[name="summary"]').first().fill("这是一条由 Playwright 创建的测试摘要。");
  await page.locator('textarea[name="content"]').first().fill("这是一条由 Playwright 创建的测试正文，用来验证创建、编辑、删除和 AI 操作是否正常工作。");
  await page.locator('input[name="tags"]').first().fill("自动化测试, Playwright");
  await page.getByRole("button", { name: "创建 Note" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
}

async function openCreatedNote(page: Page, title: string) {
  const noteCard = page.locator("article").filter({
    has: page.getByRole("heading", { name: title }),
  });

  await noteCard.getByRole("link", { name: "查看详情" }).click();
  await expect(page).toHaveURL(/\/notes\//);
  await expect(page.locator('textarea[name="content"]')).toBeVisible();
}

test("已登录用户可以创建 Note 并进入详情页", async ({ page }) => {
  const creds = uniqueCredentials();
  const { admin, userId } = await createConfirmedUser(creds.email, creds.password);

  try {
    await loginAs(page, creds);
    await createNoteFromDashboard(page, creds.title);
    await openCreatedNote(page, creds.title);

    await expect(page.locator('input[name="title"]')).toHaveValue(creds.title);
    await expect(page.locator('button[formnovalidate]')).toHaveCount(4);
  } finally {
    await admin.auth.admin.deleteUser(userId);
  }
});

test("已登录用户可以编辑并删除 Note", async ({ page }) => {
  test.setTimeout(60_000);

  const creds = uniqueCredentials();
  const { admin, userId } = await createConfirmedUser(creds.email, creds.password);
  const updatedTitle = `${creds.title} - 已更新`;

  try {
    await loginAs(page, creds);
    await createNoteFromDashboard(page, creds.title);
    await openCreatedNote(page, creds.title);

    await page.locator('input[name="title"]').fill(updatedTitle);
    await page.getByRole("button", { name: "保存修改" }).click();

    await expect(page).toHaveURL(/\/notes\//);
    await expect(page.locator('input[name="title"]')).toHaveValue(updatedTitle);

    const deleteButton = page.locator("button.button-danger");
    await deleteButton.scrollIntoViewIfNeeded();
    await deleteButton.click({ force: true });

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: updatedTitle })).toHaveCount(0);
  } finally {
    await admin.auth.admin.deleteUser(userId);
  }
});

test("AI 优化标题后会出现撤销入口", async ({ page }) => {
  test.setTimeout(60_000);

  const creds = uniqueCredentials();
  const { admin, userId } = await createConfirmedUser(creds.email, creds.password);

  try {
    await loginAs(page, creds);
    await createNoteFromDashboard(page, creds.title);
    await openCreatedNote(page, creds.title);

    await expect(page.locator('button[formnovalidate]')).toHaveCount(4);
    await page.locator('button[formnovalidate]').first().click();

    await expect(page).toHaveURL(/\/notes\//);
    await expect(page.locator('button[formnovalidate]')).toHaveCount(5, { timeout: 25000 });
    await expect(page.locator('input[name="title"]')).not.toHaveValue(creds.title);
  } finally {
    await admin.auth.admin.deleteUser(userId);
  }
});
