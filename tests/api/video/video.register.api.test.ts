import { strict as assert } from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import { Container } from "../../../features/shared/container/index.js";
import type { UnmanagedContent } from "../../../features/unmanaged-content/unmanagedContent.model.js";
import { registerVideo } from "../../../src/main/apis/videos/video.register.api.js";
import type { Context } from "../../../src/main/context.js";
import { depend, TOKENS } from "../../../src/main/depend.injection.js";
import { createTestDatabase } from "../../helpers/createTestDatabase.js";
import { testLogger } from "../../helpers/testlogger.js";
import { createTestIpcMainInvokeEvent } from "../testIpcMainInvokeEvent.js";
import { TestJobQueue } from "../testjobqueue.js";

const CATEGORY_NAME = "video-register-api";

describe("ビデオ登録API", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("ビデオを正常に登録し、onSuccessが呼ばれonErrorは呼ばれないことを検証", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"video.register.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();
		const cache = new Map<string, UnmanagedContent>();

		cache.set("sample-resource-id", {
			id: "sample-resource-id",
			path: "tests/api/datas/test-data.mp4",
		});

		// コンテナを作成してTestJobQueueを登録
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.DATABASE, () => database);
		container.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		container.register(TOKENS.CACHE, () => cache);

		// 準備
		const request = {
			resourceIds: ["sample-resource-id"],
			rawTags: "tag1 tag2",
			// authorIds: ["author-id-123"],
		};

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成（モックされたeventを含む）
		const context: Context = {
			container,
			event: mockEvent,
		};

		// 実行
		await registerVideo(context, request);

		// JobQueueの完了を待つ
		await testJobQueue.waitForCompletion();

		// 検証
		// onSuccessが呼ばれることを確認
		assert.equal(
			testJobQueue.successCallbacks.length,
			1,
			"onSuccess should be called exactly once",
		);

		// onErrorが呼ばれないことを確認
		assert.equal(
			testJobQueue.errorCallbacks.length,
			0,
			"onError should not be called",
		);

		// 成功時の詳細を検証
		const firstSuccess = testJobQueue.successCallbacks[0];
		assert.ok(firstSuccess, "Success callback should exist");
		assert.equal(
			firstSuccess.name,
			"register-video",
			"Job name should be 'register-video'",
		);
		assert.ok(firstSuccess.value, "Video should be registered successfully");
	});
});
