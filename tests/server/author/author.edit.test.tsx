import { strict as assert } from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import { load } from "cheerio";
import { eq } from "drizzle-orm";
import { renderToString } from "react-dom/server";
import type { Author } from "../../../features/author/author.model.js";
import { Container } from "../../../features/shared/container/index.js";
import { AUTHORS } from "../../../features/shared/database/schema.js";
import { depend, TOKENS } from "../../../src/main/depend.injection.js";
import { createServer } from "../../../src/server/server.js";
import AuthorEditPage from "../../../src/server/view/pages/author.edit.page.js";
import { TestJobQueue } from "../../api/testjobqueue.js";
import { createTestDatabase } from "../../helpers/createTestDatabase.js";
import { normalizeHtml } from "../../helpers/normalizeHtml.js";
import { testLogger } from "../../helpers/testlogger.js";

const CATEGORY_NAME = "author-edit-server";

describe("作者編集画面", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("AuthorEditPageが正しくレンダリングされる", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.edit.render.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// 事前準備: 作者を登録
		const authorRepository = container.get(TOKENS.AUTHOR_REPOSITORY);
		const authorId = await authorRepository.generateId();
		await authorRepository.save({
			id: authorId,
			name: "テスト作者",
			urls: {
				twitter: "https://twitter.com/test",
			},
		});

		const app = createServer(container);

		const res = await app.request(`/author/${authorId}/edit`);
		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);
		const renderedHtml = $("#app").html();

		const expectedHtml = renderToString(
			<AuthorEditPage
				author={{
					id: authorId,
					name: "テスト作者",
					urls: {
						twitter: "https://twitter.com/test",
					},
				}}
			/>,
		);

		assert.equal(
			normalizeHtml(renderedHtml || ""),
			normalizeHtml(expectedHtml),
		);
	});

	it("作者情報を正常に更新できること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.edit.post.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// 事前準備: 作者を登録
		const authorRepository = container.get(TOKENS.AUTHOR_REPOSITORY);
		const authorId = await authorRepository.generateId();
		await authorRepository.save({
			id: authorId,
			name: "元の作者名",
			urls: {
				twitter: "https://twitter.com/original",
			},
		});

		const app = createServer(container);

		const formData = new FormData();
		formData.append("name", "更新後の作者名");
		formData.append(
			"urls",
			JSON.stringify({
				twitter: "https://twitter.com/updated",
				youtube: "https://youtube.com/@updated",
			}),
		);

		// POSTリクエスト送信（OriginヘッダーでCSRF対策）
		const postRes = await app.request(`/author/${authorId}/edit`, {
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
		assert.equal(
			redirectUrl,
			`/author/${authorId}`,
			"作者詳細画面にリダイレクトされること",
		);

		// JobQueueの完了を待つ
		await testJobQueue.waitForCompletion();

		// TestJobQueueから更新されたAuthorを取得
		const successCallback = testJobQueue.successCallbacks.find(
			(cb) => cb.name === "update-author",
		);
		assert.ok(successCallback, "ジョブが成功していること");
		const updatedAuthor = successCallback.value as Author;

		// AUTHORSテーブルにauthorが更新されていることを確認
		const authorRecord = await database
			.select()
			.from(AUTHORS)
			.where(eq(AUTHORS.id, updatedAuthor.id));
		assert.equal(authorRecord.length, 1, "作者がAUTHORSテーブルに存在すること");
		assert.equal(authorRecord[0]?.name, "更新後の作者名");
		assert.deepEqual(authorRecord[0]?.urls, {
			twitter: "https://twitter.com/updated",
			youtube: "https://youtube.com/@updated",
		});
	});

	it("不正なJSON形式のURLsでエラーになること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.edit.invalid-json.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// 事前準備: 作者を登録
		const authorRepository = container.get(TOKENS.AUTHOR_REPOSITORY);
		const authorId = await authorRepository.generateId();
		await authorRepository.save({
			id: authorId,
			name: "元の作者名",
			urls: {},
		});

		const app = createServer(container);

		const formData = new FormData();
		formData.append("name", "更新後の作者名");
		formData.append("urls", "invalid-json-string");

		// POSTリクエスト送信（OriginヘッダーでCSRF対策）
		const postRes = await app.request(`/author/${authorId}/edit`, {
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
			"update-author",
			"Job name should be 'update-author'",
		);
		assert.ok(firstError.error, "Error should exist");
	});

	it("空のURLsオブジェクトで正常に更新できること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.edit.empty-urls.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// 事前準備: 作者を登録
		const authorRepository = container.get(TOKENS.AUTHOR_REPOSITORY);
		const authorId = await authorRepository.generateId();
		await authorRepository.save({
			id: authorId,
			name: "元の作者名",
			urls: {
				twitter: "https://twitter.com/original",
			},
		});

		const app = createServer(container);

		const formData = new FormData();
		formData.append("name", "URLなし作者");
		formData.append("urls", JSON.stringify({}));

		// POSTリクエスト送信（OriginヘッダーでCSRF対策）
		const postRes = await app.request(`/author/${authorId}/edit`, {
			method: "POST",
			body: formData,
			headers: {
				Origin: "http://localhost",
			},
		});
		assert.equal(postRes.status, 302); // リダイレクトを確認

		// JobQueueの完了を待つ
		await testJobQueue.waitForCompletion();

		// TestJobQueueから更新されたAuthorを取得
		const successCallback = testJobQueue.successCallbacks.find(
			(cb) => cb.name === "update-author",
		);
		assert.ok(successCallback, "ジョブが成功していること");
		const updatedAuthor = successCallback.value as Author;

		// AUTHORSテーブルにauthorが更新されていることを確認
		const authorRecord = await database
			.select()
			.from(AUTHORS)
			.where(eq(AUTHORS.id, updatedAuthor.id));
		assert.equal(authorRecord.length, 1, "作者がAUTHORSテーブルに存在すること");
		assert.equal(authorRecord[0]?.name, "URLなし作者");
		assert.deepEqual(authorRecord[0]?.urls, {});
	});
});
