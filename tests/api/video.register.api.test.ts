import { strict as assert } from "node:assert";
import { describe, it, mock } from "node:test";
import type { IpcMainInvokeEvent } from "electron";
import { Container } from "../../features/shared/container/index.js";
import type { UnmanagedContent } from "../../features/unmanaged-content/unmanagedContent.model.js";
import { registerVideo } from "../../src/main/apis/videos/video.register.api.js";
import type { Context } from "../../src/main/context.js";
import { depend, TOKENS } from "../../src/main/depend.injection.js";
import { TestJobQueue } from "./testjobqueue.js";

describe("ビデオ登録API", () => {
	it("ビデオを正常に登録し、onSuccessが呼ばれonErrorは呼ばれないことを検証", async () => {
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
		container.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		container.register(TOKENS.CACHE, () => cache);

		// 準備
		const request = {
			resourceId: "sample-resource-id",
			rawTags: "tag1 tag2",
			// authorId: "author-id-123",
		};

		// IpcMainInvokeEventのモックを作成
		const mockEvent = {
			processId: 1,
			frameId: 1,
			sender: {
				id: 1,
				send: mock.fn(),
				sendSync: mock.fn(),
				sendTo: mock.fn(),
				sendToFrame: mock.fn(),
				postMessage: mock.fn(),
			} as unknown as IpcMainInvokeEvent["sender"],
			senderFrame: {} as unknown as IpcMainInvokeEvent["senderFrame"],
			preventDefault: mock.fn(),
		} as unknown as IpcMainInvokeEvent;

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
