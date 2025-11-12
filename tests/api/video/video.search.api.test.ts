import assert from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import { Container } from "../../../features/shared/container/index.js";
import {
	CONTENTS,
	TAGS,
	VIDEOS,
	VIDEOS_CONTENTS,
	VIDEOS_TAGS,
} from "../../../features/shared/database/schema.js";
import { searchVideo } from "../../../src/main/apis/videos/video.search.api.js";
import { depend, TOKENS } from "../../../src/main/depend.injection.js";
import { createTestDatabase } from "../../helpers/createTestDatabase.js";
import { testLogger } from "../../helpers/testlogger.js";
import { createTestIpcMainInvokeEvent } from "../testIpcMainInvokeEvent.js";

const CATEGORY_NAME = "video-search-api";

describe("ビデオ検索API", () => {
	before(async () => {
		await rm("./tests/db/video.search.api", { recursive: true, force: true });
	});

	it("ビデオを空文字で検索した場合、すべて検索できること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"video.search.test",
		);

		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		// データベースインスタンスを上書き
		container.register(TOKENS.DATABASE, () => database);

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

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			keyword: "",
			sortBy: "createdAt",
			order: "desc",
			page: 1,
			size: 20,
		};

		// 実行
		const response = await searchVideo(context, request);

		// 検証
		assert.equal(response.count, 2);
		assert.equal(response.page, 1);
		assert.equal(response.size, 20);

		const videos = response.result;
		assert.equal(videos.length, 2);

		// ビデオ1の検証
		const video1 = videos.find((v) => v.id === "1");
		assert.ok(video1, "ビデオ1が存在すること");
		if (!video1) throw new Error("ビデオ1が見つかりません");

		assert.equal(video1.tags.length, 2);
		assert.ok(video1.tags.some((t) => t.id === "1" && t.name === "tag001"));
		assert.ok(video1.tags.some((t) => t.id === "2" && t.name === "tag002"));
		assert.equal(video1.contents.length, 1);
		assert.ok(video1.contents[0], "ビデオ1のコンテンツが存在すること");
		assert.equal(video1.contents[0]?.id, "1");
		assert.equal(video1.contents[0]?.name, "content001");
		assert.equal(video1.contents[0]?.path, "contents/video");

		// ビデオ2の検証
		const video2 = videos.find((v) => v.id === "2");
		assert.ok(video2, "ビデオ2が存在すること");
		if (!video2) throw new Error("ビデオ2が見つかりません");

		assert.equal(video2.tags.length, 1);
		assert.ok(video2.tags[0], "ビデオ2のタグが存在すること");
		assert.equal(video2.tags[0]?.id, "1");
		assert.equal(video2.tags[0]?.name, "tag001");
		assert.equal(video2.contents.length, 1);
		assert.ok(video2.contents[0], "ビデオ2のコンテンツが存在すること");
		assert.equal(video2.contents[0]?.id, "2");
		assert.equal(video2.contents[0]?.name, "content002");
		assert.equal(video2.contents[0]?.path, "contents/video");
	});
});
