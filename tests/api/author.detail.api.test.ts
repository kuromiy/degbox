import assert from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import { Container } from "../../features/shared/container/index.js";
import {
	AUTHORS,
	CONTENTS,
	VIDEOS,
	VIDEOS_AUTHORS,
	VIDEOS_CONTENTS,
} from "../../features/shared/database/schema.js";
import { getAuthorDetail } from "../../src/main/apis/authors/author.detail.api.js";
import { depend, TOKENS } from "../../src/main/depend.injection.js";
import { createTestDatabase } from "../helpers/createTestDatabase.js";
import { testLogger } from "../helpers/testlogger.js";
import { createTestIpcMainInvokeEvent } from "./testIpcMainInvokeEvent.js";

const CATEGORY_NAME = "author-detail-api";

describe("作者詳細API", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("作者情報と紐づいた動画一覧を取得できること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.detail.basic.test",
		);

		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.DATABASE, () => database);

		// 作者データ
		await database.insert(AUTHORS).values({
			id: "author1",
			name: "テスト作者",
			urls: {
				twitter: "https://twitter.com/test",
				youtube: "https://youtube.com/@test",
			},
		});

		// ビデオデータ
		await database.insert(VIDEOS).values({ id: "v1" });
		await database.insert(VIDEOS).values({ id: "v2" });
		await database.insert(VIDEOS).values({ id: "v3" });

		// コンテンツデータ
		await database.insert(CONTENTS).values({
			id: "c1",
			path: "/path/to/video1",
			name: "動画1",
			hash: "hash1",
		});
		await database.insert(CONTENTS).values({
			id: "c2",
			path: "/path/to/video2",
			name: "動画2",
			hash: "hash2",
		});
		await database.insert(CONTENTS).values({
			id: "c3",
			path: "/path/to/video3",
			name: "動画3",
			hash: "hash3",
		});

		// 作者とビデオの関連
		await database
			.insert(VIDEOS_AUTHORS)
			.values({ videoId: "v1", authorId: "author1" });
		await database
			.insert(VIDEOS_AUTHORS)
			.values({ videoId: "v2", authorId: "author1" });
		await database
			.insert(VIDEOS_AUTHORS)
			.values({ videoId: "v3", authorId: "author1" });

		// ビデオとコンテンツの関連
		await database
			.insert(VIDEOS_CONTENTS)
			.values({ videoId: "v1", contentId: "c1" });
		await database
			.insert(VIDEOS_CONTENTS)
			.values({ videoId: "v2", contentId: "c2" });
		await database
			.insert(VIDEOS_CONTENTS)
			.values({ videoId: "v3", contentId: "c3" });

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			authorId: "author1",
			videoPage: 1,
			videoSize: 20,
		};

		// 実行
		const response = await getAuthorDetail(context, request);

		// 検証
		assert.equal(response.id, "author1");
		assert.equal(response.name, "テスト作者");
		assert.deepEqual(response.urls, {
			twitter: "https://twitter.com/test",
			youtube: "https://youtube.com/@test",
		});

		assert.equal(response.videos.count, 3);
		assert.equal(response.videos.page, 1);
		assert.equal(response.videos.size, 20);
		assert.equal(response.videos.result.length, 3);

		// 動画情報の検証
		const videoTitles = response.videos.result.map((v) => v.title);
		assert.ok(videoTitles.includes("動画1"));
		assert.ok(videoTitles.includes("動画2"));
		assert.ok(videoTitles.includes("動画3"));
	});

	it("動画のページネーションが正しく動作すること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.detail.pagination.test",
		);

		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.DATABASE, () => database);

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

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};

		// ページ1（サイズ3）
		const request1 = {
			authorId: "author1",
			videoPage: 1,
			videoSize: 3,
		};
		const response1 = await getAuthorDetail(context, request1);

		assert.equal(response1.videos.count, 10);
		assert.equal(response1.videos.page, 1);
		assert.equal(response1.videos.size, 3);
		assert.equal(response1.videos.result.length, 3);

		// ページ2（サイズ3）
		const request2 = {
			authorId: "author1",
			videoPage: 2,
			videoSize: 3,
		};
		const response2 = await getAuthorDetail(context, request2);

		assert.equal(response2.videos.count, 10);
		assert.equal(response2.videos.page, 2);
		assert.equal(response2.videos.size, 3);
		assert.equal(response2.videos.result.length, 3);

		// ページ1とページ2で異なる動画が返ることを確認
		const page1Ids = response1.videos.result.map((v) => v.id);
		const page2Ids = response2.videos.result.map((v) => v.id);
		const hasOverlap = page1Ids.some((id) => page2Ids.includes(id));
		assert.ok(!hasOverlap, "ページ1とページ2で重複する動画がないこと");
	});

	it("紐づいた動画がない作者の場合、空の動画リストが返ること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.detail.novideo.test",
		);

		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.DATABASE, () => database);

		// 作者データ
		await database.insert(AUTHORS).values({
			id: "author1",
			name: "動画なし作者",
			urls: {},
		});

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			authorId: "author1",
			videoPage: 1,
			videoSize: 20,
		};

		// 実行
		const response = await getAuthorDetail(context, request);

		// 検証
		assert.equal(response.id, "author1");
		assert.equal(response.name, "動画なし作者");
		assert.equal(response.videos.count, 0);
		assert.equal(response.videos.result.length, 0);
	});

	it("存在しない作者IDの場合、エラーが発生すること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.detail.notfound.test",
		);

		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.DATABASE, () => database);

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			authorId: "non-existent",
			videoPage: 1,
			videoSize: 20,
		};

		// 実行と検証
		await assert.rejects(
			async () => {
				await getAuthorDetail(context, request);
			},
			{
				message: "Author not found",
			},
		);
	});
});
