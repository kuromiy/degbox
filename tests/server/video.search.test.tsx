import assert from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import { load } from "cheerio";
import { renderToString } from "react-dom/server";
import { Container } from "../../features/shared/container/index.js";
import {
	CONTENTS,
	TAGS,
	VIDEOS,
	VIDEOS_CONTENTS,
	VIDEOS_TAGS,
} from "../../features/shared/database/schema.js";
import { depend, TOKENS } from "../../src/main/depend.injection.js";
import { createServer } from "../../src/server/server.js";
import VideoSearchPage from "../../src/server/view/pages/video.search.page.js";
import { TestJobQueue } from "../api/testjobqueue.js";
import { createTestDatabase } from "../helpers/createTestDatabase.js";
import { normalizeHtml } from "../helpers/normalizeHtml.js";
import { testLogger } from "./testlogger.js";

const CATEGORY_NAME = "video-search-server";

describe("ビデオ検索画面", () => {
	before(async () => {
		await rm("./tests/db/video.search", { recursive: true, force: true });
	});

	it("VideoSearchPageが正しくレンダリングされる", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"video.search.render.test",
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

		const res = await app.request("/video/search");
		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);
		const renderedHtml = $("#app").html();

		const expectedHtml = renderToString(<VideoSearchPage />);

		assert.equal(
			normalizeHtml(renderedHtml || ""),
			normalizeHtml(expectedHtml),
		);
	});

	it("空文字で検索した場合、すべてのビデオが表示されること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"video.search.query.test",
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
		// タグ
		await database.insert(TAGS).values({ id: "1", name: "tag001" });
		await database.insert(TAGS).values({ id: "2", name: "tag002" });

		// コンテンツ
		await database.insert(CONTENTS).values({
			id: "1",
			path: "contents/video",
			name: "content001",
			hash: "content001",
		});
		await database.insert(CONTENTS).values({
			id: "2",
			path: "contents/video",
			name: "content002",
			hash: "content002",
		});

		// ビデオ
		await database.insert(VIDEOS).values({ id: "1" });
		await database.insert(VIDEOS).values({ id: "2" });

		// ビデオタグ
		await database.insert(VIDEOS_TAGS).values({ videoId: "1", tagId: "1" });
		await database.insert(VIDEOS_TAGS).values({ videoId: "1", tagId: "2" });
		await database.insert(VIDEOS_TAGS).values({ videoId: "2", tagId: "1" });

		// ビデオコンテンツ
		await database
			.insert(VIDEOS_CONTENTS)
			.values({ videoId: "1", contentId: "1" });
		await database
			.insert(VIDEOS_CONTENTS)
			.values({ videoId: "2", contentId: "2" });

		const app = createServer(container);

		// 空文字で検索
		const res = await app.request("/video/search?keyword=");
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
					tags: [{ id: "1", name: "tag001" }],
					contents: [
						{
							id: "2",
							path: "contents/video",
							name: "content002",
							hash: "content002",
						},
					],
					authors: [],
					thumbnailPath:
						"http://localhost:8080/file/contents/video/thumbnail.jpg",
					previewGifPath:
						"http://localhost:8080/file/contents/video/preview.gif",
				},
				{
					id: "1",
					tags: [
						{ id: "1", name: "tag001" },
						{ id: "2", name: "tag002" },
					],
					contents: [
						{
							id: "1",
							path: "contents/video",
							name: "content001",
							hash: "content001",
						},
					],
					authors: [],
					thumbnailPath:
						"http://localhost:8080/file/contents/video/thumbnail.jpg",
					previewGifPath:
						"http://localhost:8080/file/contents/video/preview.gif",
				},
			],
			page: 1,
			size: 20,
			keyword: "",
		};

		const expectedHtml = renderToString(
			<VideoSearchPage searchResult={expectedSearchResult} />,
		);

		assert.equal(
			normalizeHtml(renderedHtml || ""),
			normalizeHtml(expectedHtml),
		);
	});
});
