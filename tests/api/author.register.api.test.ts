import { strict as assert } from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import type { Author } from "../../features/author/author.model.js";
import { Container } from "../../features/shared/container/index.js";
import { registerAuthor } from "../../src/main/apis/authors/author.register.api.js";
import type { Context } from "../../src/main/context.js";
import { depend, TOKENS } from "../../src/main/depend.injection.js";
import { createTestDatabase } from "../helpers/createTestDatabase.js";
import { testLogger } from "../helpers/testlogger.js";
import { createTestIpcMainInvokeEvent } from "./testIpcMainInvokeEvent.js";
import { TestJobQueue } from "./testjobqueue.js";

const CATEGORY_NAME = "author-register-api";

describe("作者登録API", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("作者を正常に登録し、onSuccessが呼ばれonErrorは呼ばれないことを検証", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.register.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();

		// コンテナを作成してTestJobQueueを登録
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.DATABASE, () => database);
		container.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// 準備
		const request = {
			name: "テスト作者",
			urls: JSON.stringify({
				twitter: "https://twitter.com/test",
				youtube: "https://youtube.com/@test",
			}),
		};

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成（モックされたeventを含む）
		const context: Context = {
			container,
			event: mockEvent,
		};

		// 実行
		await registerAuthor(context, request);

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
			"register-author",
			"Job name should be 'register-author'",
		);
		assert.ok(firstSuccess.value, "Author should be registered successfully");

		// 型アサーション
		const author = firstSuccess.value as Author;
		assert.equal(author.name, "テスト作者", "Author name should match");
		assert.ok(author.id, "Author should have an ID");
		assert.deepEqual(
			author.urls,
			{
				twitter: "https://twitter.com/test",
				youtube: "https://youtube.com/@test",
			},
			"Author URLs should match",
		);
	});

	it("不正なJSON形式のURLsでエラーになることを検証", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.register.invalid-json.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();

		// コンテナを作成してTestJobQueueを登録
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.DATABASE, () => database);
		container.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// 準備 - 不正なJSON文字列
		const request = {
			name: "テスト作者",
			urls: "invalid-json-string",
		};

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// 実行
		await registerAuthor(context, request);

		// JobQueueの完了を待つ
		await testJobQueue.waitForCompletion();

		// 検証
		// onSuccessが呼ばれないことを確認
		assert.equal(
			testJobQueue.successCallbacks.length,
			0,
			"onSuccess should not be called",
		);

		// onErrorが呼ばれることを確認
		assert.equal(
			testJobQueue.errorCallbacks.length,
			1,
			"onError should be called exactly once",
		);

		// エラーメッセージの検証
		const firstError = testJobQueue.errorCallbacks[0];
		assert.ok(firstError, "Error callback should exist");
		assert.equal(
			firstError.name,
			"register-author",
			"Job name should be 'register-author'",
		);
		assert.ok(firstError.error, "Error should exist");
	});

	it("空のURLsオブジェクトで正常に登録できることを検証", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.register.empty-urls.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();

		// コンテナを作成してTestJobQueueを登録
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.DATABASE, () => database);
		container.register(TOKENS.JOB_QUEUE, () => testJobQueue);

		// 準備 - 空のURLsオブジェクト
		const request = {
			name: "URLなし作者",
			urls: JSON.stringify({}),
		};

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// 実行
		await registerAuthor(context, request);

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

		// 型アサーション
		const author = firstSuccess.value as Author;
		assert.equal(author.name, "URLなし作者", "Author name should match");
		assert.deepEqual(author.urls, {}, "URLs should be empty object");
	});
});
