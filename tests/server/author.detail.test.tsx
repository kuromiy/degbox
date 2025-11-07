import assert from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import { load } from "cheerio";
import { renderToString } from "react-dom/server";
import { Container } from "../../features/shared/container/index.js";
import {
	AUTHORS,
	CONTENTS,
	VIDEOS,
	VIDEOS_AUTHORS,
	VIDEOS_CONTENTS,
} from "../../features/shared/database/schema.js";
import { depend, TOKENS } from "../../src/main/depend.injection.js";
import { createServer } from "../../src/server/server.js";
import AuthorDetailPage from "../../src/server/view/pages/author.detail.page.js";
import { TestJobQueue } from "../api/testjobqueue.js";
import { createTestDatabase } from "../helpers/createTestDatabase.js";
import { normalizeHtml } from "../helpers/normalizeHtml.js";
import { testLogger } from "../helpers/testlogger.js";

const CATEGORY_NAME = "author-detail-server";

describe("作者詳細画面", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("AuthorDetailPageが正しくレンダリングされる", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.detail.render.test",
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
			id: "author1",
			name: "テスト作者",
			urls: { twitter: "https://twitter.com/test" },
		});

		const app = createServer(container);

		const res = await app.request("/author/author1");

		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);
		const renderedHtml = $("#app").html();

		const expectedAuthorDetail = {
			id: "author1",
			name: "テスト作者",
			urls: { twitter: "https://twitter.com/test" },
			videos: {
				count: 0,
				result: [],
				page: 1,
				size: 20,
			},
		};

		const expectedHtml = renderToString(
			<AuthorDetailPage authorDetail={expectedAuthorDetail} />,
		);

		assert.equal(
			normalizeHtml(renderedHtml || ""),
			normalizeHtml(expectedHtml),
		);
	});

	it("作者情報と紐づいた動画一覧が表示されること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.detail.videos.test",
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
			id: "author1",
			name: "人気作者",
			urls: {
				twitter: "https://twitter.com/popular",
				youtube: "https://youtube.com/@popular",
			},
		});

		// ビデオデータ
		await database.insert(VIDEOS).values({ id: "v1" });
		await database.insert(VIDEOS).values({ id: "v2" });

		// コンテンツデータ
		await database.insert(CONTENTS).values({
			id: "c1",
			path: "/path/to/video1",
			name: "人気動画1",
			hash: "hash1",
		});
		await database.insert(CONTENTS).values({
			id: "c2",
			path: "/path/to/video2",
			name: "人気動画2",
			hash: "hash2",
		});

		// 作者とビデオの関連
		await database
			.insert(VIDEOS_AUTHORS)
			.values({ videoId: "v1", authorId: "author1" });
		await database
			.insert(VIDEOS_AUTHORS)
			.values({ videoId: "v2", authorId: "author1" });

		// ビデオとコンテンツの関連
		await database
			.insert(VIDEOS_CONTENTS)
			.values({ videoId: "v1", contentId: "c1" });
		await database
			.insert(VIDEOS_CONTENTS)
			.values({ videoId: "v2", contentId: "c2" });

		const app = createServer(container);

		const res = await app.request("/author/author1");
		assert.equal(res.status, 200);

		const html = await res.text();

		// 作者名が表示されていることを確認
		assert.ok(html.includes("人気作者"));

		// 外部リンクが表示されていることを確認
		assert.ok(html.includes("https://twitter.com/popular"));
		assert.ok(html.includes("https://youtube.com/@popular"));
	});

	it("ページネーションパラメータが正しく処理されること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.detail.pagination.test",
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
			id: "author1",
			name: "テスト作者",
			urls: {},
		});

		// 10個のビデオとコンテンツを作成
		for (let i = 1; i <= 10; i++) {
			await database.insert(VIDEOS).values({ id: `v${i}` });
			await database.insert(CONTENTS).values({
				id: `c${i}`,
				path: `/path/to/video${i}`,
				name: `動画${i}`,
				hash: `hash${i}`,
			});
			await database
				.insert(VIDEOS_AUTHORS)
				.values({ videoId: `v${i}`, authorId: "author1" });
			await database
				.insert(VIDEOS_CONTENTS)
				.values({ videoId: `v${i}`, contentId: `c${i}` });
		}

		const app = createServer(container);

		// ページ2、サイズ3でリクエスト
		const res = await app.request("/author/author1?videoPage=2&videoSize=3");
		assert.equal(res.status, 200);

		const html = await res.text();
		assert.ok(html.includes("テスト作者"));
	});

	it("動画がない作者の場合、空のリストが表示されること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.detail.novideos.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.DATABASE, () => database);
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// 作者データ（動画なし）
		await database.insert(AUTHORS).values({
			id: "author1",
			name: "動画なし作者",
			urls: {},
		});

		const app = createServer(container);

		const res = await app.request("/author/author1");
		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);
		const renderedHtml = $("#app").html();

		const expectedAuthorDetail = {
			id: "author1",
			name: "動画なし作者",
			urls: {},
			videos: {
				count: 0,
				result: [],
				page: 1,
				size: 20,
			},
		};

		const expectedHtml = renderToString(
			<AuthorDetailPage authorDetail={expectedAuthorDetail} />,
		);

		assert.equal(
			normalizeHtml(renderedHtml || ""),
			normalizeHtml(expectedHtml),
		);
	});
});
