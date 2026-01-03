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
} from "../../../features/shared/database/application/schema.js";
import { ValidError } from "../../../features/shared/error/valid/index.js";
import {
	detailVideo,
	detailVideoValidator,
} from "../../../src/main/apis/videos/video.detail.api.js";
import { depend } from "../../../src/main/di/dependencies.js";
import { TOKENS } from "../../../src/main/di/token.js";
import { createTestDatabase } from "../../helpers/createTestDatabase.js";
import { testLogger } from "../../helpers/testlogger.js";
import { createTestIpcMainInvokeEvent } from "../testIpcMainInvokeEvent.js";

const CATEGORY_NAME = "video-detail-api";

describe("ビデオ詳細API", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("指定したビデオIDで詳細を取得できること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"video.detail.test",
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
			type: "video",
		});

		// ビデオ
		const videoId = "123e4567-e89b-42d3-a456-426614174000";
		await database.insert(VIDEOS).values({ id: videoId });

		// ビデオタグ
		await database.insert(VIDEOS_TAGS).values({ videoId: videoId, tagId: "1" });
		await database.insert(VIDEOS_TAGS).values({ videoId: videoId, tagId: "2" });

		// ビデオコンテンツ
		await database
			.insert(VIDEOS_CONTENTS)
			.values({ videoId: videoId, contentId: "1" });

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			videoId: videoId,
		};

		// 実行
		const video = await detailVideo(context, request);

		// 検証
		assert.ok(video, "ビデオが取得できること");
		assert.equal(video.id, videoId);

		// タグの検証
		assert.equal(video.tags.length, 2);
		assert.ok(video.tags.some((t) => t.id === "1" && t.name === "tag001"));
		assert.ok(video.tags.some((t) => t.id === "2" && t.name === "tag002"));

		// コンテンツの検証
		assert.equal(video.contents.length, 1);
		assert.ok(video.contents[0], "ビデオのコンテンツが存在すること");
		assert.equal(video.contents[0]?.content.id, "1");
		assert.equal(video.contents[0]?.content.name, "content001");
		assert.equal(video.contents[0]?.content.path, "contents/video");
	});

	it("存在しないビデオIDでエラーになること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"video.detail.notfound.test",
		);

		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		// データベースインスタンスを上書き
		container.register(TOKENS.DATABASE, () => database);

		// ビデオは作成するが、別のIDで検索
		await database
			.insert(VIDEOS)
			.values({ id: "123e4567-e89b-42d3-a456-426614174000" });

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			videoId: "223e4567-e89b-42d3-a456-426614174000", // 存在しないID
		};

		// 実行と検証
		await assert.rejects(
			async () => {
				await detailVideo(context, request);
			},
			{
				message: "Video not found",
			},
		);
	});

	it("不正なUUID形式でバリデーションエラーになること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"video.detail.invalid.test",
		);

		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		// データベースインスタンスを上書き
		container.register(TOKENS.DATABASE, () => database);

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			videoId: "invalid-uuid-format", // 不正な形式
		};

		// バリデータを直接呼び出してバリデーションエラーを検証
		assert.throws(
			() => {
				detailVideoValidator(request, context);
			},
			ValidError,
			"不正なUUID形式の場合はValidErrorが発生すべき",
		);
	});
});
