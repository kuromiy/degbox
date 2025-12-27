import { strict as assert } from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import type { Illust } from "../../../features/illust/illust.model.js";
import { Container } from "../../../features/shared/container/index.js";
import type { UnmanagedContent } from "../../../features/unmanaged-content/unmanagedContent.model.js";
import { registerIllust } from "../../../src/main/apis/illusts/illust.register.api.js";
import type { Context } from "../../../src/main/context.js";
import { depend } from "../../../src/main/di/dependencies.js";
import { TOKENS } from "../../../src/main/di/token.js";
import { createTestDatabase } from "../../helpers/createTestDatabase.js";
import { testLogger } from "../../helpers/testlogger.js";
import { createTestIpcMainInvokeEvent } from "../testIpcMainInvokeEvent.js";
import { TestJobQueue } from "../testjobqueue.js";

const CATEGORY_NAME = "illust-register-api";

describe("イラスト登録API", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("イラストを正常に登録し、onSuccessが呼ばれonErrorは呼ばれないことを検証", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.register.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();
		const cache = new Map<string, UnmanagedContent>();

		// 複数のテストデータを登録（イラストは複数のコンテンツを持つ）
		cache.set("sample-resource-id-1", {
			id: "sample-resource-id-1",
			path: "tests/api/datas/test-image-1.jpg",
		});
		cache.set("sample-resource-id-2", {
			id: "sample-resource-id-2",
			path: "tests/api/datas/test-image-2.jpg",
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
			resourceIds: ["sample-resource-id-1", "sample-resource-id-2"],
			rawTags: "tag1 tag2 tag3",
			// authorIds: ["author-id-123"], // オプション
		};

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成（モックされたeventを含む）
		const context: Context = {
			container,
			event: mockEvent,
		};

		// 実行
		await registerIllust(context, request);

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
			"register-illust",
			"Job name should be 'register-illust'",
		);
		assert.ok(firstSuccess.value, "Illust should be registered successfully");

		// イラストの内容を検証
		const illust = firstSuccess.value as Illust;
		assert.ok(illust.id, "Illust should have an ID");
		assert.equal(illust.contents.length, 2, "Illust should have 2 contents");
		assert.equal(illust.tags.length, 3, "Illust should have 3 tags");
		// コンテンツの並び順が正しいことを確認
		assert.ok(illust.contents[0], "First content should exist");
		assert.equal(
			illust.contents[0].order,
			0,
			"First content order should be 0",
		);
		assert.ok(illust.contents[1], "Second content should exist");
		assert.equal(
			illust.contents[1].order,
			1,
			"Second content order should be 1",
		);
	});

	it("作者IDを指定してイラストを登録", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.register.with-author.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();
		const cache = new Map<string, UnmanagedContent>();

		cache.set("sample-resource-id-3", {
			id: "sample-resource-id-3",
			path: "tests/api/datas/test-image-3.jpg",
		});

		// コンテナを作成
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.DATABASE, () => database);
		container.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		container.register(TOKENS.CACHE, () => cache);

		// コンテナから作者リポジトリを取得して作者を登録
		const authorRepository = container.get(TOKENS.AUTHOR_REPOSITORY);
		const author = await authorRepository.save({
			id: "test-author-id",
			name: "Test Author",
			urls: {},
		});

		// 準備（作者IDを含む）
		const request = {
			resourceIds: ["sample-resource-id-3"],
			rawTags: "tag1",
			authorIds: [author.id],
		};

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// 実行
		await registerIllust(context, request);

		// JobQueueの完了を待つ
		await testJobQueue.waitForCompletion();

		// 検証
		assert.equal(
			testJobQueue.successCallbacks.length,
			1,
			"onSuccess should be called",
		);
		assert.equal(
			testJobQueue.errorCallbacks.length,
			0,
			"onError should not be called",
		);

		const firstSuccess = testJobQueue.successCallbacks[0];
		assert.ok(firstSuccess, "Success callback should exist");
		const illust = firstSuccess.value as Illust;
		assert.equal(illust.authors.length, 1, "Illust should have 1 author");
		assert.ok(illust.authors[0], "Author should exist");
		assert.equal(illust.authors[0].id, author.id, "Author ID should match");
	});

	it("不正なリクエスト（resourceIdsが空）でエラーが発生することを検証", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.register.invalid.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();
		const cache = new Map<string, UnmanagedContent>();

		// コンテナを作成
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.DATABASE, () => database);
		container.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		container.register(TOKENS.CACHE, () => cache);

		// 不正なリクエスト（resourceIdsが空配列）
		const request = {
			resourceIds: [],
			rawTags: "tag1",
		};

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// 実行 - バリデーションエラーが発生することを検証
		await assert.rejects(
			async () => {
				await registerIllust(context, request);
			},
			Error,
			"resourceIds が空の場合はバリデーションエラーが発生すべき",
		);
	});
});
