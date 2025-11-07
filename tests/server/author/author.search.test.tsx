import assert from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import { load } from "cheerio";
import { renderToString } from "react-dom/server";
import { Container } from "../../../features/shared/container/index.js";
import {
	AUTHORS,
	VIDEOS,
	VIDEOS_AUTHORS,
} from "../../../features/shared/database/schema.js";
import { depend, TOKENS } from "../../../src/main/depend.injection.js";
import { createServer } from "../../../src/server/server.js";
import AuthorSearchPage from "../../../src/server/view/pages/author.search.page.js";
import { TestJobQueue } from "../../api/testjobqueue.js";
import { createTestDatabase } from "../../helpers/createTestDatabase.js";
import { normalizeHtml } from "../../helpers/normalizeHtml.js";
import { testLogger } from "../../helpers/testlogger.js";

const CATEGORY_NAME = "author-search-server";

describe("作者検索画面", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("AuthorSearchPageが正しくレンダリングされる", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.search.render.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.DATABASE, () => database);
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		const app = createServer(container);

		const res = await app.request("/author/search");

		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);
		const renderedHtml = $("#app").html();

		const expectedHtml = renderToString(
			<AuthorSearchPage
				searchResult={{
					count: 0,
					result: [],
					page: 1,
					size: 20,
				}}
			/>,
		);

		assert.equal(
			normalizeHtml(renderedHtml || ""),
			normalizeHtml(expectedHtml),
		);
	});

	it("作者名で検索した場合、該当する作者が表示されること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.search.query.test",
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
		// 作者
		await database.insert(AUTHORS).values({
			id: "1",
			name: "山田太郎",
			urls: { twitter: "https://twitter.com/yamada" },
		});
		await database.insert(AUTHORS).values({
			id: "2",
			name: "田中花子",
			urls: { youtube: "https://youtube.com/@tanaka" },
		});
		await database.insert(AUTHORS).values({
			id: "3",
			name: "佐藤次郎",
			urls: {},
		});

		// ビデオ
		await database.insert(VIDEOS).values({ id: "v1" });
		await database.insert(VIDEOS).values({ id: "v2" });

		// 作者とビデオの関連
		await database
			.insert(VIDEOS_AUTHORS)
			.values({ videoId: "v1", authorId: "1" });
		await database
			.insert(VIDEOS_AUTHORS)
			.values({ videoId: "v2", authorId: "1" });
		await database
			.insert(VIDEOS_AUTHORS)
			.values({ videoId: "v2", authorId: "2" });

		const app = createServer(container);

		// "田"で検索
		const res = await app.request("/author/search?name=田");
		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);
		const renderedHtml = $("#app").html();

		// 期待されるsearchResultデータ
		const expectedSearchResult = {
			count: 2,
			result: [
				{
					id: "2",
					name: "田中花子",
					urls: { youtube: "https://youtube.com/@tanaka" },
					videoCount: 1,
				},
				{
					id: "1",
					name: "山田太郎",
					urls: { twitter: "https://twitter.com/yamada" },
					videoCount: 2,
				},
			],
			page: 1,
			size: 20,
			name: "田",
		};

		const expectedHtml = renderToString(
			<AuthorSearchPage searchResult={expectedSearchResult} />,
		);

		assert.equal(
			normalizeHtml(renderedHtml || ""),
			normalizeHtml(expectedHtml),
		);
	});

	it("該当する作者がいない場合、空の結果が表示されること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.search.empty.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.DATABASE, () => database);
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// 作者データ
		await database.insert(AUTHORS).values({
			id: "1",
			name: "山田太郎",
			urls: {},
		});

		const app = createServer(container);

		// 存在しない名前で検索
		const res = await app.request("/author/search?name=存在しない");
		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);
		const renderedHtml = $("#app").html();

		const expectedSearchResult = {
			count: 0,
			result: [],
			page: 1,
			size: 20,
			name: "存在しない",
		};

		const expectedHtml = renderToString(
			<AuthorSearchPage searchResult={expectedSearchResult} />,
		);

		assert.equal(
			normalizeHtml(renderedHtml || ""),
			normalizeHtml(expectedHtml),
		);
	});
});
