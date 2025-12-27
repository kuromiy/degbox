import { strict as assert } from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import { load } from "cheerio";
import { renderToString } from "react-dom/server";
import { Container } from "../../../features/shared/container/index.js";
import {
	CONTENTS,
	ILLUSTS,
	ILLUSTS_CONTENTS,
	ILLUSTS_TAGS,
	TAGS,
} from "../../../features/shared/database/application/schema.js";
import { depend } from "../../../src/main/di/dependencies.js";
import { TOKENS } from "../../../src/main/di/token.js";
import { createServer } from "../../../src/server/server.js";
import IllustSearchPage from "../../../src/server/view/pages/illust.search.page.js";
import { TestJobQueue } from "../../api/testjobqueue.js";
import { createTestDatabase } from "../../helpers/createTestDatabase.js";
import { normalizeHtml } from "../../helpers/normalizeHtml.js";
import { testLogger } from "../../helpers/testlogger.js";

const CATEGORY_NAME = "illust-search-server";

describe("イラスト検索画面", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("IllustSearchPageが正しくレンダリングされる（デフォルト状態）", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.search.render.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.DATABASE, () => database);
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		const app = createServer({ container, fileRoot: process.cwd() });

		const res = await app.request("/illust/search");

		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);
		const renderedHtml = $("#app").html();

		const expectedHtml = renderToString(
			<IllustSearchPage
				searchResult={{
					items: [],
					total: 0,
					page: 1,
					limit: 20,
					hasNext: false,
					hasPrev: false,
				}}
			/>,
		);

		assert.equal(
			normalizeHtml(renderedHtml || ""),
			normalizeHtml(expectedHtml),
		);
	});

	it("タグで検索した場合、該当するイラストが表示される", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.search.tag.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.DATABASE, () => database);
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// テストデータのセットアップ
		// タグを作成
		await database.insert(TAGS).values({ id: "tag-1", name: "landscape" });
		await database.insert(TAGS).values({ id: "tag-2", name: "nature" });
		await database.insert(TAGS).values({ id: "tag-3", name: "portrait" });

		// イラストを作成
		await database.insert(ILLUSTS).values({
			id: "illust-1",
		});
		await database.insert(ILLUSTS).values({
			id: "illust-2",
		});
		await database.insert(ILLUSTS).values({
			id: "illust-3",
		});

		// イラストとタグの関連を作成
		await database.insert(ILLUSTS_TAGS).values({
			illustId: "illust-1",
			tagId: "tag-1", // landscape
		});
		await database.insert(ILLUSTS_TAGS).values({
			illustId: "illust-1",
			tagId: "tag-2", // nature
		});
		await database.insert(ILLUSTS_TAGS).values({
			illustId: "illust-2",
			tagId: "tag-3", // portrait
		});
		await database.insert(ILLUSTS_TAGS).values({
			illustId: "illust-3",
			tagId: "tag-1", // landscape
		});

		// コンテンツを作成
		await database.insert(CONTENTS).values({
			id: "content-1",
			path: "/path/to/content-1.jpg",
			name: "content-1.jpg",
			hash: "hash-1",
		});
		await database.insert(CONTENTS).values({
			id: "content-2",
			path: "/path/to/content-2.jpg",
			name: "content-2.jpg",
			hash: "hash-2",
		});
		await database.insert(CONTENTS).values({
			id: "content-3",
			path: "/path/to/content-3.jpg",
			name: "content-3.jpg",
			hash: "hash-3",
		});

		// イラストのコンテンツを作成（最低1つのコンテンツが必要）
		await database.insert(ILLUSTS_CONTENTS).values({
			illustId: "illust-1",
			order: 0,
			contentId: "content-1",
		});
		await database.insert(ILLUSTS_CONTENTS).values({
			illustId: "illust-2",
			order: 0,
			contentId: "content-2",
		});
		await database.insert(ILLUSTS_CONTENTS).values({
			illustId: "illust-3",
			order: 0,
			contentId: "content-3",
		});

		const app = createServer({ container, fileRoot: process.cwd() });

		// "landscape" タグで検索
		const res = await app.request("/illust/search?keyword=landscape");
		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);

		// 検索結果に2件のイラストが含まれていることを確認（id: 1, 3）
		const illustCards = $("[data-testid='illust-card']");
		assert.equal(
			illustCards.length,
			2,
			"landscape タグを持つイラストは2件であるべき",
		);
	});

	it("ページングが正しく動作する（hasNext、hasPrevが正しく設定される）", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.search.paging.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.DATABASE, () => database);
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// テストデータのセットアップ
		// 5件のイラストを作成
		for (let i = 1; i <= 5; i++) {
			await database.insert(ILLUSTS).values({
				id: `illust-${i}`,
			});
			await database.insert(CONTENTS).values({
				id: `content-${i}`,
				path: `/path/to/content-${i}.jpg`,
				name: `content-${i}.jpg`,
				hash: `hash-${i}`,
			});
			await database.insert(ILLUSTS_CONTENTS).values({
				illustId: `illust-${i}`,
				order: 0,
				contentId: `content-${i}`,
			});
		}

		const app = createServer({ container, fileRoot: process.cwd() });

		// 1ページ目を取得（limit=2）
		const page1Res = await app.request("/illust/search?page=1&limit=2");
		assert.equal(page1Res.status, 200);
		const page1Html = await page1Res.text();
		const $page1 = load(page1Html);

		// hasNext、hasPrevのチェック（無効化状態を確認）
		const page1NextLinks = $page1("[data-testid='next-page-link']");
		const page1PrevLinks = $page1("[data-testid='prev-page-link']");
		assert.ok(
			page1NextLinks.length > 0,
			"1ページ目は次のページリンクが存在すべき",
		);
		// 前のページリンクは無効化されているべき（aria-disabled="true"）
		page1PrevLinks.each((_, elem) => {
			assert.equal(
				$page1(elem).attr("aria-disabled"),
				"true",
				"1ページ目の前のページリンクは無効化されているべき",
			);
		});

		// 2ページ目を取得
		const page2Res = await app.request("/illust/search?page=2&limit=2");
		assert.equal(page2Res.status, 200);
		const page2Html = await page2Res.text();
		const $page2 = load(page2Html);

		const page2NextLinks = $page2("[data-testid='next-page-link']");
		const page2PrevLinks = $page2("[data-testid='prev-page-link']");
		assert.ok(
			page2NextLinks.length > 0,
			"2ページ目は次のページリンクが存在すべき",
		);
		assert.ok(
			page2PrevLinks.length > 0,
			"2ページ目は前のページリンクが存在すべき",
		);
		// 次と前のページリンクは有効化されているべき（aria-disabled="false"）
		page2NextLinks.each((_, elem) => {
			assert.equal(
				$page2(elem).attr("aria-disabled"),
				"false",
				"2ページ目の次のページリンクは有効化されているべき",
			);
		});
		page2PrevLinks.each((_, elem) => {
			assert.equal(
				$page2(elem).attr("aria-disabled"),
				"false",
				"2ページ目の前のページリンクは有効化されているべき",
			);
		});

		// 3ページ目を取得
		const page3Res = await app.request("/illust/search?page=3&limit=2");
		assert.equal(page3Res.status, 200);
		const page3Html = await page3Res.text();
		const $page3 = load(page3Html);

		const page3NextLinks = $page3("[data-testid='next-page-link']");
		const page3PrevLinks = $page3("[data-testid='prev-page-link']");
		assert.ok(
			page3NextLinks.length > 0,
			"3ページ目は次のページリンクが存在すべき",
		);
		assert.ok(
			page3PrevLinks.length > 0,
			"3ページ目は前のページリンクが存在すべき",
		);
		// 次のページリンクは無効化されているべき（aria-disabled="true"）
		page3NextLinks.each((_, elem) => {
			assert.equal(
				$page3(elem).attr("aria-disabled"),
				"true",
				"3ページ目の次のページリンクは無効化されているべき",
			);
		});
		// 前のページリンクは有効化されているべき（aria-disabled="false"）
		page3PrevLinks.each((_, elem) => {
			assert.equal(
				$page3(elem).attr("aria-disabled"),
				"false",
				"3ページ目の前のページリンクは有効化されているべき",
			);
		});
	});

	it("該当するイラストがない場合、空の結果が表示される", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.search.empty.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.DATABASE, () => database);
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// タグは作成するが、イラストは作成しない
		await database.insert(TAGS).values({ id: "tag-test", name: "test" });

		const app = createServer({ container, fileRoot: process.cwd() });

		// 存在しないタグで検索
		const res = await app.request("/illust/search?keyword=nonexistent");
		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);

		// 重要な要素を検証
		assert.ok(
			html.includes("該当するイラストが見つかりませんでした"),
			"空の結果メッセージが表示されるべき",
		);
		// タグ検索の場合は「全0件 - タグ: "nonexistent"」のように表示される
		assert.ok(
			html.includes("全") && html.includes("0") && html.includes("件"),
			"全0件の表示があるべき",
		);
		assert.ok(html.includes("nonexistent"), "検索タグが表示されるべき");

		// イラストカードが表示されていないことを確認
		const illustCards = $("[data-testid='illust-card']");
		assert.equal(illustCards.length, 0, "イラストカードは表示されないべき");
	});

	it("不正なクエリパラメータでバリデーションエラーが発生し、空の結果が表示される", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.search.validation.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.DATABASE, () => database);
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		const app = createServer({ container, fileRoot: process.cwd() });

		// 不正なページ番号（0以下）
		const res1 = await app.request("/illust/search?page=0");
		assert.equal(res1.status, 200, "バリデーションエラーでも200を返すべき");
		const html1 = await res1.text();
		const $1 = load(html1);
		// バリデーションエラー時は空の結果が返されることを確認
		const illustCards1 = $1("[data-testid='illust-card']");
		assert.equal(
			illustCards1.length,
			0,
			"不正なページ番号では空の結果が返されるべき",
		);

		// 不正なリミット（101以上）
		const res2 = await app.request("/illust/search?limit=101");
		assert.equal(res2.status, 200, "バリデーションエラーでも200を返すべき");
		const html2 = await res2.text();
		const $2 = load(html2);
		// バリデーションエラー時は空の結果が返されることを確認
		const illustCards2 = $2("[data-testid='illust-card']");
		assert.equal(
			illustCards2.length,
			0,
			"不正なリミットでは空の結果が返されるべき",
		);
	});
});
