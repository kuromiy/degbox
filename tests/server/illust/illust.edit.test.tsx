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
import IllustEditPage from "../../../src/server/view/pages/illust.edit.page.js";
import { TestJobQueue } from "../../api/testjobqueue.js";
import { createTestDatabase } from "../../helpers/createTestDatabase.js";
import { normalizeHtml } from "../../helpers/normalizeHtml.js";
import { testLogger } from "../../helpers/testlogger.js";

const CATEGORY_NAME = "illust-edit-server";

describe("イラスト編集画面", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("IllustEditPageが正しくレンダリングされる", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.edit.render.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// 事前準備: イラストを登録
		const illustAction = container.get(TOKENS.ILLUST_ACTION);
		const contentAction = container.get(TOKENS.CONTENT_ACTION);
		const tagAction = container.get(TOKENS.TAG_ACTION);

		// テスト用の画像ファイルを準備
		const imagePath = join("tests", "api", "datas", "test-image-1.jpg");
		const imageBuffer = await readFile(imagePath);
		const fs = container.get(TOKENS.FILE_SYSTEM);

		// 画像を一時ファイルに保存してコンテンツ登録
		const tempPath = await fs.writeTempFile(imageBuffer, "jpg");
		const content = await contentAction.register(tempPath);

		// タグを作成
		const tags = await tagAction.getOrCreate(["tag1", "tag2"]);

		// イラストを作成
		const illust = await illustAction.register(tags, [content], []);

		const app = createServer(container);

		const res = await app.request(`/illust/${illust.id}/edit`);
		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);
		const renderedHtml = $("#app").html();

		const expectedHtml = renderToString(<IllustEditPage illust={illust} />);

		assert.equal(
			normalizeHtml(renderedHtml || ""),
			normalizeHtml(expectedHtml),
		);
	});

	it("イラスト情報を正常に更新できること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.edit.post.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// 事前準備: イラストを登録
		const illustAction = container.get(TOKENS.ILLUST_ACTION);
		const contentAction = container.get(TOKENS.CONTENT_ACTION);
		const tagAction = container.get(TOKENS.TAG_ACTION);

		// テスト用の画像ファイルを準備
		const imagePath = join("tests", "api", "datas", "test-image-1.jpg");
		const imageBuffer = await readFile(imagePath);
		const fs = container.get(TOKENS.FILE_SYSTEM);

		// 画像を一時ファイルに保存してコンテンツ登録
		const tempPath = await fs.writeTempFile(imageBuffer, "jpg");
		const content = await contentAction.register(tempPath);

		// タグを作成
		const tags = await tagAction.getOrCreate(["original-tag"]);

		// イラストを作成
		const illust = await illustAction.register(tags, [content], []);

		const app = createServer(container);

		const formData = new FormData();
		formData.append("imageItems", `existing:${content.id}`);
		formData.append("tags", "updated-tag1 updated-tag2");

		// POSTリクエスト送信（OriginヘッダーでCSRF対策）
		const postRes = await app.request(`/illust/${illust.id}/edit`, {
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
			`/illust/detail/${illust.id}`,
			"イラスト詳細画面にリダイレクトされること",
		);

		// JobQueueの完了を待つ
		await testJobQueue.waitForCompletion();

		// TestJobQueueから更新されたIllustを取得
		const successCallback = testJobQueue.successCallbacks.find(
			(cb) => cb.name === "update-illust",
		);
		assert.ok(successCallback, "ジョブが成功していること");
		const updatedIllust = successCallback.value as Illust;

		// ILLUSTSテーブルにillustが存在することを確認
		const illustRecord = await database
			.select()
			.from(ILLUSTS)
			.where(eq(ILLUSTS.id, updatedIllust.id));
		assert.equal(
			illustRecord.length,
			1,
			"イラストがILLUSTSテーブルに存在すること",
		);

		// ILLUSTS_TAGSテーブルにタグの関連が存在することを確認
		const illustTags = await database
			.select()
			.from(ILLUSTS_TAGS)
			.where(eq(ILLUSTS_TAGS.illustId, updatedIllust.id));
		assert.equal(
			illustTags.length,
			2,
			"タグの関連が2件存在すること（updated-tag1, updated-tag2）",
		);
	});

	it("画像の順序を変更できること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.edit.reorder.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// 事前準備: 複数の画像を持つイラストを登録
		const illustAction = container.get(TOKENS.ILLUST_ACTION);
		const contentAction = container.get(TOKENS.CONTENT_ACTION);
		const tagAction = container.get(TOKENS.TAG_ACTION);
		const fs = container.get(TOKENS.FILE_SYSTEM);

		// テスト用の画像ファイルを準備
		const imagePath1 = join("tests", "api", "datas", "test-image-1.jpg");
		const imagePath2 = join("tests", "api", "datas", "test-image-2.jpg");
		const imageBuffer1 = await readFile(imagePath1);
		const imageBuffer2 = await readFile(imagePath2);

		// 画像を一時ファイルに保存してコンテンツ登録
		const tempPath1 = await fs.writeTempFile(imageBuffer1, "jpg");
		const tempPath2 = await fs.writeTempFile(imageBuffer2, "jpg");
		const content1 = await contentAction.register(tempPath1);
		const content2 = await contentAction.register(tempPath2);

		// タグを作成
		const tags = await tagAction.getOrCreate(["reorder-test"]);

		// イラストを作成
		const illust = await illustAction.register(tags, [content1, content2], []);

		const app = createServer(container);

		const formData = new FormData();
		// 順序を逆にする
		formData.append("imageItems", `existing:${content2.id}`);
		formData.append("imageItems", `existing:${content1.id}`);
		formData.append("tags", "reorder-test");

		// POSTリクエスト送信（OriginヘッダーでCSRF対策）
		const postRes = await app.request(`/illust/${illust.id}/edit`, {
			method: "POST",
			body: formData,
			headers: {
				Origin: "http://localhost",
			},
		});
		assert.equal(postRes.status, 302); // リダイレクトを確認

		// JobQueueの完了を待つ
		await testJobQueue.waitForCompletion();

		// TestJobQueueから更新されたIllustを取得
		const successCallback = testJobQueue.successCallbacks.find(
			(cb) => cb.name === "update-illust",
		);
		assert.ok(successCallback, "ジョブが成功していること");
		const updatedIllust = successCallback.value as Illust;

		// コンテンツの並び順が逆になっていることを確認
		const illustContents = await database
			.select()
			.from(ILLUSTS_CONTENTS)
			.where(eq(ILLUSTS_CONTENTS.illustId, updatedIllust.id));
		assert.equal(illustContents.length, 2, "コンテンツの関連が2件存在すること");

		const sortedContents = illustContents.sort((a, b) => a.order - b.order);
		assert.ok(sortedContents[0], "最初のコンテンツが存在すること");
		assert.equal(
			sortedContents[0].contentId,
			content2.id,
			"最初のコンテンツがcontent2であること",
		);
		assert.ok(sortedContents[1], "2番目のコンテンツが存在すること");
		assert.equal(
			sortedContents[1].contentId,
			content1.id,
			"2番目のコンテンツがcontent1であること",
		);
	});

	it("新規画像を追加できること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.edit.add-image.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// 事前準備: イラストを登録
		const illustAction = container.get(TOKENS.ILLUST_ACTION);
		const contentAction = container.get(TOKENS.CONTENT_ACTION);
		const tagAction = container.get(TOKENS.TAG_ACTION);
		const unmanagedContentRepository = container.get(
			TOKENS.UNMANAGED_CONTENT_REPOSITORY,
		);
		const fs = container.get(TOKENS.FILE_SYSTEM);

		// テスト用の画像ファイルを準備（既存画像）
		const imagePath1 = join("tests", "api", "datas", "test-image-1.jpg");
		const imageBuffer1 = await readFile(imagePath1);

		// 既存画像を一時ファイルに保存してコンテンツ登録
		const tempPath1 = await fs.writeTempFile(imageBuffer1, "jpg");
		const content1 = await contentAction.register(tempPath1);

		// タグを作成
		const tags = await tagAction.getOrCreate(["add-test"]);

		// イラストを作成（1つの画像のみ）
		const illust = await illustAction.register(tags, [content1], []);

		// 新規画像を準備
		const imagePath2 = join("tests", "api", "datas", "test-image-2.jpg");
		const imageBuffer2 = await readFile(imagePath2);
		const resourceId2 = "edit-add-test-resource-2";
		const tempPath2 = await fs.writeTempFile(imageBuffer2, "jpg");

		// 非管理コンテンツとして保存（編集フォームからのアップロードをシミュレート）
		await unmanagedContentRepository.save({
			id: resourceId2,
			path: tempPath2,
		});

		const app = createServer(container);

		const formData = new FormData();
		formData.append("imageItems", `existing:${content1.id}`);
		formData.append("imageItems", `new:${resourceId2}`);
		formData.append("tags", "add-test updated");

		// POSTリクエスト送信（OriginヘッダーでCSRF対策）
		const postRes = await app.request(`/illust/${illust.id}/edit`, {
			method: "POST",
			body: formData,
			headers: {
				Origin: "http://localhost",
			},
		});
		assert.equal(postRes.status, 302); // リダイレクトを確認

		// JobQueueの完了を待つ
		await testJobQueue.waitForCompletion();

		// TestJobQueueから更新されたIllustを取得
		const successCallback = testJobQueue.successCallbacks.find(
			(cb) => cb.name === "update-illust",
		);
		assert.ok(successCallback, "ジョブが成功していること");
		const updatedIllust = successCallback.value as Illust;

		// コンテンツが2つになっていることを確認
		const illustContents = await database
			.select()
			.from(ILLUSTS_CONTENTS)
			.where(eq(ILLUSTS_CONTENTS.illustId, updatedIllust.id));
		assert.equal(illustContents.length, 2, "コンテンツの関連が2件存在すること");

		// タグが更新されていることを確認
		const illustTags = await database
			.select()
			.from(ILLUSTS_TAGS)
			.where(eq(ILLUSTS_TAGS.illustId, updatedIllust.id));
		assert.equal(illustTags.length, 2, "タグの関連が2件存在すること");
	});

	it("作者を追加できること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.edit.add-author.test",
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
		const author = await authorRepository.save({
			id: "edit-test-author-id",
			name: "Edit Test Author",
			urls: {},
		});

		// 事前準備: イラストを登録
		const illustAction = container.get(TOKENS.ILLUST_ACTION);
		const contentAction = container.get(TOKENS.CONTENT_ACTION);
		const tagAction = container.get(TOKENS.TAG_ACTION);
		const fs = container.get(TOKENS.FILE_SYSTEM);

		// テスト用の画像ファイルを準備
		const imagePath = join("tests", "api", "datas", "test-image-1.jpg");
		const imageBuffer = await readFile(imagePath);

		// 画像を一時ファイルに保存してコンテンツ登録
		const tempPath = await fs.writeTempFile(imageBuffer, "jpg");
		const content = await contentAction.register(tempPath);

		// タグを作成
		const tags = await tagAction.getOrCreate(["author-test"]);

		// イラストを作成（作者なし）
		const illust = await illustAction.register(tags, [content], []);

		const app = createServer(container);

		const formData = new FormData();
		formData.append("imageItems", `existing:${content.id}`);
		formData.append("tags", "author-test");
		formData.append("authorIds", author.id);

		// POSTリクエスト送信（OriginヘッダーでCSRF対策）
		const postRes = await app.request(`/illust/${illust.id}/edit`, {
			method: "POST",
			body: formData,
			headers: {
				Origin: "http://localhost",
			},
		});
		assert.equal(postRes.status, 302); // リダイレクトを確認

		// JobQueueの完了を待つ
		await testJobQueue.waitForCompletion();

		// TestJobQueueから更新されたIllustを取得
		const successCallback = testJobQueue.successCallbacks.find(
			(cb) => cb.name === "update-illust",
		);
		assert.ok(successCallback, "ジョブが成功していること");
		const updatedIllust = successCallback.value as Illust;

		// 作者が追加されていることを確認
		assert.equal(updatedIllust.authors.length, 1, "作者が1人であること");
		assert.equal(
			updatedIllust.authors[0]?.id,
			author.id,
			"作者IDが一致すること",
		);
	});
});
