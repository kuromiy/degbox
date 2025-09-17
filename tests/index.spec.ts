import {
	_electron,
	type ElectronApplication,
	expect,
	type Page,
	test,
} from "@playwright/test";

let electronApp: ElectronApplication;
let page: Page;

test.beforeEach(async () => {
	electronApp = await _electron.launch({
		args: ["dist/main/index.mjs"],
		env: { ...process.env, IS_TEST: "true" },
	});
	page = await electronApp.firstWindow();
});

test.afterEach(async () => {
	await electronApp.close();
});

test("Index Pageが表示されていること", async () => {
	await expect(page.locator("text=Index Page")).toBeVisible({ timeout: 30000 });
});
