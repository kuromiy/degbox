import { strict as assert } from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import { load } from "cheerio";
import { eq } from "drizzle-orm";
import { renderToString } from "react-dom/server";
import type { Author } from "../../../features/author/author.model.js";
import { Container } from "../../../features/shared/container/index.js";
import { AUTHORS } from "../../../features/shared/database/application/schema.js";
import { depend } from "../../../src/main/di/dependencies.js";
import { TOKENS } from "../../../src/main/di/token.js";
import { createServer } from "../../../src/server/server.js";
import AuthorRegisterPage from "../../../src/server/view/pages/author.register.page.js";
import { TestJobQueue } from "../../api/testjobqueue.js";
import { createTestDatabase } from "../../helpers/createTestDatabase.js";
import { normalizeHtml } from "../../helpers/normalizeHtml.js";
import { testLogger } from "../../helpers/testlogger.js";

const CATEGORY_NAME = "author-register-server";

describe("作者登録画面", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("AuthorRegisterPageが正しくレンダリングされる", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.register.render.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		const app = createServer({ container, fileRoot: process.cwd() });

		const res = await app.request("/author/register");
		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);
		const renderedHtml = $("#app").html();

		const expectedHtml = renderToString(<AuthorRegisterPage />);

		assert.equal(
			normalizeHtml(renderedHtml || ""),
			normalizeHtml(expectedHtml),
		);
	});

	it("作者登録ができること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.register.post.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		const app = createServer({ container, fileRoot: process.cwd() });

		const formData = new FormData();
		formData.append("name", "テスト作者");
		formData.append(
			"urls",
			JSON.stringify({
				twitter: "https://twitter.com/test",
				youtube: "https://youtube.com/@test",
			}),
		);

		// POSTリクエスト送信（OriginヘッダーでCSRF対策）
		const postRes = await app.request("/author/register", {
			method: "POST",
			body: formData,
			headers: {
				Origin: "http://localhost",
			},
		});
		assert.equal(postRes.status, 302); // リダイレクトを確認

		// リダイレクト先URLを取得
		const redirectUrl = postRes.headers.get("Location");
		assert.ok(redirectUrl, "Location ヘッダーが存在すること");

		// リダイレクト先にGETリクエスト
		const getRes = await app.request(redirectUrl);
		assert.equal(getRes.status, 200);

		// リダイレクト先のページを検証
		const html = await getRes.text();
		const $ = load(html);
		const renderedHtml = $("#app").html();
		const expectedHtml = renderToString(<AuthorRegisterPage />);

		assert.equal(
			normalizeHtml(renderedHtml || ""),
			normalizeHtml(expectedHtml),
		);

		// JobQueueの完了を待つ
		await testJobQueue.waitForCompletion();

		// TestJobQueueから登録されたAuthorを取得
		const successCallback = testJobQueue.successCallbacks.find(
			(cb) => cb.name === "register-author",
		);
		assert.ok(successCallback, "ジョブが成功していること");
		const registeredAuthor = successCallback.value as Author;

		// AUTHORSテーブルにauthorが存在することを確認
		const authorRecord = await database
			.select()
			.from(AUTHORS)
			.where(eq(AUTHORS.id, registeredAuthor.id));
		assert.equal(authorRecord.length, 1, "作者がAUTHORSテーブルに存在すること");
		assert.equal(authorRecord[0]?.name, "テスト作者");
		assert.deepEqual(authorRecord[0]?.urls, {
			twitter: "https://twitter.com/test",
			youtube: "https://youtube.com/@test",
		});
	});

	it("不正なJSON形式のURLsでエラーになること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.register.invalid-json.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		const app = createServer({ container, fileRoot: process.cwd() });

		const formData = new FormData();
		formData.append("name", "テスト作者");
		formData.append("urls", "invalid-json-string");

		// POSTリクエスト送信（OriginヘッダーでCSRF対策）
		const postRes = await app.request("/author/register", {
			method: "POST",
			body: formData,
			headers: {
				Origin: "http://localhost",
			},
		});
		assert.equal(postRes.status, 302); // リダイレクトを確認

		// JobQueueの完了を待つ
		await testJobQueue.waitForCompletion();

		// onErrorが呼ばれることを確認
		assert.equal(
			testJobQueue.errorCallbacks.length,
			1,
			"onError should be called exactly once",
		);

		// エラーメッセージの検証
		const firstError = testJobQueue.errorCallbacks[0];
		assert.ok(firstError, "Error callback should exist");
		assert.equal(
			firstError.name,
			"register-author",
			"Job name should be 'register-author'",
		);
		assert.ok(firstError.error, "Error should exist");
	});

	it("空のURLsオブジェクトで正常に登録できること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.register.empty-urls.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		const app = createServer({ container, fileRoot: process.cwd() });

		const formData = new FormData();
		formData.append("name", "URLなし作者");
		formData.append("urls", JSON.stringify({}));

		// POSTリクエスト送信（OriginヘッダーでCSRF対策）
		const postRes = await app.request("/author/register", {
			method: "POST",
			body: formData,
			headers: {
				Origin: "http://localhost",
			},
		});
		assert.equal(postRes.status, 302); // リダイレクトを確認

		// JobQueueの完了を待つ
		await testJobQueue.waitForCompletion();

		// TestJobQueueから登録されたAuthorを取得
		const successCallback = testJobQueue.successCallbacks.find(
			(cb) => cb.name === "register-author",
		);
		assert.ok(successCallback, "ジョブが成功していること");
		const registeredAuthor = successCallback.value as Author;

		// AUTHORSテーブルにauthorが存在することを確認
		const authorRecord = await database
			.select()
			.from(AUTHORS)
			.where(eq(AUTHORS.id, registeredAuthor.id));
		assert.equal(authorRecord.length, 1, "作者がAUTHORSテーブルに存在すること");
		assert.equal(authorRecord[0]?.name, "URLなし作者");
		assert.deepEqual(authorRecord[0]?.urls, {});
	});
});
