import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, it } from "node:test";
import { load } from "cheerio";
import { eq } from "drizzle-orm";
import { renderToString } from "react-dom/server";
import { Container } from "../../features/shared/container/index.js";
import {
	VIDEOS,
	VIDEOS_CONTENTS,
	VIDEOS_TAGS,
} from "../../features/shared/database/schema.js";
import type { Video } from "../../features/video/video.model.js";
import { depend, TOKENS } from "../../src/main/depend.injection.js";
import { createServer } from "../../src/server/server.js";
import VideoRegisterPage from "../../src/server/view/pages/video.register.page.js";
import { TestJobQueue } from "../api/testjobqueue.js";
import { testLogger } from "./testlogger.js";

const testJobQueue = new TestJobQueue();
const container = new Container();
depend.forEach(({ token, provider }) => {
	container.register(token, provider);
});
container.register(TOKENS.LOGGER, () => testLogger);
container.register(TOKENS.JOB_QUEUE, () => testJobQueue);
const app = createServer(container);

describe("ビデオ登録画面", () => {
	it("VideoRegisterPageが正しくレンダリングされる", async () => {
		const res = await app.request("/video/register");
		assert.equal(res.status, 200);

		const html = await res.text();
		const $ = load(html);
		const renderedHtml = $("#app").html();

		const expectedHtml = renderToString(<VideoRegisterPage />);

		const normalize = (html: string) =>
			html
				.replace(/\s+/g, " ") // 複数の空白を1つに
				.replace(/encType/gi, "enctype") // encTypeをenctypeに統一
				.replace(/\/>/g, ">") // 自己閉じタグのスラッシュを削除
				.trim();

		assert.equal(normalize(renderedHtml || ""), normalize(expectedHtml));
	});

	it("ビデオ登録ができること", async () => {
		const formData = new FormData();

		// 実際の動画ファイルを読み込み
		const videoPath = join("tests", "api", "datas", "test-data.mp4");
		const videoBuffer = await readFile(videoPath);
		const videoFile = new File([new Uint8Array(videoBuffer)], "test-data.mp4", {
			type: "video/mp4",
		});

		formData.append("file", videoFile);
		formData.append("tags", "tag1 tag2");

		// POSTリクエスト送信
		const postRes = await app.request("/video/register", {
			method: "POST",
			body: formData,
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
		const expectedHtml = renderToString(<VideoRegisterPage />);

		const normalize = (html: string) =>
			html
				.replace(/\s+/g, " ") // 複数の空白を1つに
				.replace(/encType/gi, "enctype") // encTypeをenctypeに統一
				.replace(/\/>/g, ">") // 自己閉じタグのスラッシュを削除
				.trim();

		assert.equal(normalize(renderedHtml || ""), normalize(expectedHtml));

		// JobQueueの完了を待つ
		await testJobQueue.waitForCompletion();

		// 登録された動画がデータベースに存在することを確認する
		const database = container.get(TOKENS.DATABASE);

		// TestJobQueueから登録されたVideoを取得
		const successCallback = testJobQueue.successCallbacks.find(
			(cb) => cb.name === "register-video",
		);
		assert.ok(successCallback, "ジョブが成功していること");
		const registeredVideo = successCallback.value as Video;

		// VIDEOSテーブルにvideoが存在することを確認
		const videoRecord = await database
			.select()
			.from(VIDEOS)
			.where(eq(VIDEOS.id, registeredVideo.id));
		assert.equal(videoRecord.length, 1, "動画がVIDEOSテーブルに存在すること");

		// VIDEOS_TAGSテーブルにタグの関連が存在することを確認
		const videoTags = await database
			.select()
			.from(VIDEOS_TAGS)
			.where(eq(VIDEOS_TAGS.videoId, registeredVideo.id));
		assert.equal(
			videoTags.length,
			2,
			"タグの関連が2件存在すること（tag1, tag2）",
		);

		// VIDEOS_CONTENTSテーブルにコンテンツの関連が存在することを確認
		const videoContents = await database
			.select()
			.from(VIDEOS_CONTENTS)
			.where(eq(VIDEOS_CONTENTS.videoId, registeredVideo.id));
		assert.equal(videoContents.length, 1, "コンテンツの関連が1件存在すること");
	});
});
