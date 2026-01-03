import assert from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import { load } from "cheerio";
import { renderToString } from "react-dom/server";
import { Container } from "../../../features/shared/container/index.js";
import {
	CONTENTS,
	TAGS,
	VIDEOS,
	VIDEOS_CONTENTS,
	VIDEOS_TAGS,
} from "../../../features/shared/database/application/schema.js";
import { depend } from "../../../src/main/di/dependencies.js";
import { TOKENS } from "../../../src/main/di/token.js";
import { buildFileUrl } from "../../../src/server/config/index.js";
import { createServer } from "../../../src/server/server.js";
import VideoDetailPage from "../../../src/server/view/pages/video.detail.page.js";
import { TestJobQueue } from "../../api/testjobqueue.js";
import { createTestDatabase } from "../../helpers/createTestDatabase.js";
import { normalizeHtml } from "../../helpers/normalizeHtml.js";
import { testLogger } from "../../helpers/testlogger.js";

const CATEGORY_NAME = "video-detail-server";

describe("ビデオ詳細画面", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("VideoDetailPageが正しくレンダリングされる", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"video.detail.render.test",
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
		const testVideoId = "550e8400-e29b-41d4-a716-446655440000";

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
		await database.insert(VIDEOS).values({ id: testVideoId });

		// ビデオタグ
		await database
			.insert(VIDEOS_TAGS)
			.values({ videoId: testVideoId, tagId: "1" });
		await database
			.insert(VIDEOS_TAGS)
			.values({ videoId: testVideoId, tagId: "2" });

		// ビデオコンテンツ
		await database
			.insert(VIDEOS_CONTENTS)
			.values({ videoId: testVideoId, contentId: "1" });

		const app = createServer({ container, fileRoot: process.cwd() });

		const res = await app.request(`/video/detail/${testVideoId}`);
		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);
		const renderedHtml = $("#app").html();

		// 期待されるvideoデータ
		const expectedVideo = {
			id: testVideoId,
			tags: [
				{ id: "1", name: "tag001" },
				{ id: "2", name: "tag002" },
			],
			contents: [
				{
					content: {
						id: "1",
						path: "contents/video",
						name: "content001",
						type: "video" as const,
					},
					order: 0,
					videoUrl: buildFileUrl("contents/video/index.m3u8"),
				},
			],
			authors: [],
			thumbnailPath: buildFileUrl("contents/video/thumbnail.jpg"),
			previewGifPath: buildFileUrl("contents/video/preview.gif"),
		};

		const expectedHtml = renderToString(
			<VideoDetailPage video={expectedVideo} />,
		);

		assert.equal(
			normalizeHtml(renderedHtml || ""),
			normalizeHtml(expectedHtml),
		);
	});

	it("有効なvideoIdで動画が正しく表示されること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"video.detail.valid.test",
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
		const testVideoId = "550e8400-e29b-41d4-a716-446655440001";

		// タグ
		await database.insert(TAGS).values({ id: "1", name: "テストタグ" });

		// コンテンツ
		await database.insert(CONTENTS).values({
			id: "1",
			path: "contents/test-video",
			name: "test-content",
			type: "video",
		});

		// ビデオ
		await database.insert(VIDEOS).values({ id: testVideoId });

		// ビデオタグ
		await database
			.insert(VIDEOS_TAGS)
			.values({ videoId: testVideoId, tagId: "1" });

		// ビデオコンテンツ
		await database
			.insert(VIDEOS_CONTENTS)
			.values({ videoId: testVideoId, contentId: "1" });

		const app = createServer({ container, fileRoot: process.cwd() });

		const res = await app.request(`/video/detail/${testVideoId}`);
		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);

		// 動画プレーヤーが存在することを確認
		assert.ok($("video").length > 0, "動画プレーヤーが表示されること");

		// タグが表示されることを確認
		const tagText = $("body").text();
		assert.ok(tagText.includes("テストタグ"), "タグが表示されること");

		// 動画情報が表示されることを確認
		assert.ok(
			tagText.includes("動画情報"),
			"動画情報セクションが表示されること",
		);
		assert.ok(tagText.includes(testVideoId), "動画IDが表示されること");
	});
});
