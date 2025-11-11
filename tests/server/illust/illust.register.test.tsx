import { strict as assert } from "node:assert";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { before, describe, it } from "node:test";
import { load } from "cheerio";
import { eq } from "drizzle-orm";
import { renderToString } from "react-dom/server";
import type { Illust } from "../../../features/illust/illust.model.js";
import { Container } from "../../../features/shared/container/index.js";
import {
	ILLUSTS,
	ILLUSTS_CONTENTS,
	ILLUSTS_TAGS,
} from "../../../features/shared/database/schema.js";
import { depend, TOKENS } from "../../../src/main/depend.injection.js";
import { createServer } from "../../../src/server/server.js";
import IllustRegisterPage from "../../../src/server/view/pages/illust.register.page.js";
import { TestJobQueue } from "../../api/testjobqueue.js";
import { createTestDatabase } from "../../helpers/createTestDatabase.js";
import { normalizeHtml } from "../../helpers/normalizeHtml.js";
import { testLogger } from "../../helpers/testlogger.js";

const CATEGORY_NAME = "illust-register-server";

describe("イラスト登録画面", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("IllustRegisterPageが正しくレンダリングされる", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.register.render.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		const app = createServer(container);

		const res = await app.request("/illust/register");
		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);
		const renderedHtml = $("#app").html();

		const expectedHtml = renderToString(<IllustRegisterPage />);

		assert.equal(
			normalizeHtml(renderedHtml || ""),
			normalizeHtml(expectedHtml),
		);
	});

	it("イラスト登録ができること（複数画像）", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.register.post.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		const app = createServer(container);

		const formData = new FormData();

		// 複数の画像ファイルを読み込み
		const imagePath1 = join("tests", "api", "datas", "test-image-1.jpg");
		const imagePath2 = join("tests", "api", "datas", "test-image-2.jpg");
		const imagePath3 = join("tests", "api", "datas", "test-image-3.jpg");

		const imageBuffer1 = await readFile(imagePath1);
		const imageBuffer2 = await readFile(imagePath2);
		const imageBuffer3 = await readFile(imagePath3);

		const imageFile1 = new File(
			[new Uint8Array(imageBuffer1)],
			"test-image-1.jpg",
			{
				type: "image/jpeg",
			},
		);
		const imageFile2 = new File(
			[new Uint8Array(imageBuffer2)],
			"test-image-2.jpg",
			{
				type: "image/jpeg",
			},
		);
		const imageFile3 = new File(
			[new Uint8Array(imageBuffer3)],
			"test-image-3.jpg",
			{
				type: "image/jpeg",
			},
		);

		formData.append("files", imageFile1);
		formData.append("files", imageFile2);
		formData.append("files", imageFile3);
		formData.append("tags", "tag1 tag2 tag3");

		// POSTリクエスト送信（OriginヘッダーでCSRF対策）
		const postRes = await app.request("/illust/register", {
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
		const expectedHtml = renderToString(<IllustRegisterPage />);

		assert.equal(
			normalizeHtml(renderedHtml || ""),
			normalizeHtml(expectedHtml),
		);

		// JobQueueの完了を待つ
		await testJobQueue.waitForCompletion();

		// TestJobQueueから登録されたIllustを取得
		const successCallback = testJobQueue.successCallbacks.find(
			(cb) => cb.name === "register-illust",
		);
		assert.ok(successCallback, "ジョブが成功していること");
		const registeredIllust = successCallback.value as Illust;

		// ILLUSTSテーブルにillustが存在することを確認
		const illustRecord = await database
			.select()
			.from(ILLUSTS)
			.where(eq(ILLUSTS.id, registeredIllust.id));
		assert.equal(
			illustRecord.length,
			1,
			"イラストがILLUSTSテーブルに存在すること",
		);

		// ILLUSTS_TAGSテーブルにタグの関連が存在することを確認
		const illustTags = await database
			.select()
			.from(ILLUSTS_TAGS)
			.where(eq(ILLUSTS_TAGS.illustId, registeredIllust.id));
		assert.equal(
			illustTags.length,
			3,
			"タグの関連が3件存在すること（tag1, tag2, tag3）",
		);

		// ILLUSTS_CONTENTSテーブルにコンテンツの関連が存在することを確認
		const illustContents = await database
			.select()
			.from(ILLUSTS_CONTENTS)
			.where(eq(ILLUSTS_CONTENTS.illustId, registeredIllust.id));
		assert.equal(illustContents.length, 3, "コンテンツの関連が3件存在すること");

		// コンテンツの並び順が正しいことを確認
		const sortedContents = illustContents.sort((a, b) => a.order - b.order);
		assert.ok(sortedContents[0], "最初のコンテンツが存在すること");
		assert.equal(
			sortedContents[0].order,
			0,
			"最初のコンテンツの順序が0であること",
		);
		assert.ok(sortedContents[1], "2番目のコンテンツが存在すること");
		assert.equal(
			sortedContents[1].order,
			1,
			"2番目のコンテンツの順序が1であること",
		);
		assert.ok(sortedContents[2], "3番目のコンテンツが存在すること");
		assert.equal(
			sortedContents[2].order,
			2,
			"3番目のコンテンツの順序が2であること",
		);
	});

	it("イラスト登録ができること（1枚の画像）", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.register.single.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		const app = createServer(container);

		const formData = new FormData();

		// 1枚の画像ファイルを読み込み
		const imagePath = join("tests", "api", "datas", "test-image-1.jpg");
		const imageBuffer = await readFile(imagePath);
		const imageFile = new File(
			[new Uint8Array(imageBuffer)],
			"test-image-1.jpg",
			{
				type: "image/jpeg",
			},
		);

		formData.append("files", imageFile);
		formData.append("tags", "single-tag");

		// POSTリクエスト送信（OriginヘッダーでCSRF対策）
		const postRes = await app.request("/illust/register", {
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

		// JobQueueの完了を待つ
		await testJobQueue.waitForCompletion();

		// TestJobQueueから登録されたIllustを取得
		const successCallback = testJobQueue.successCallbacks.find(
			(cb) => cb.name === "register-illust",
		);
		assert.ok(successCallback, "ジョブが成功していること");
		const registeredIllust = successCallback.value as Illust;

		// ILLUSTS_CONTENTSテーブルにコンテンツの関連が1件存在することを確認
		const illustContents = await database
			.select()
			.from(ILLUSTS_CONTENTS)
			.where(eq(ILLUSTS_CONTENTS.illustId, registeredIllust.id));
		assert.equal(illustContents.length, 1, "コンテンツの関連が1件存在すること");
		assert.ok(illustContents[0], "コンテンツが存在すること");
		assert.equal(illustContents[0].order, 0, "コンテンツの順序が0であること");
	});
});
