import { strict as assert } from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import type { Illust } from "../../../features/illust/illust.model.js";
import { Container } from "../../../features/shared/container/index.js";
import type { UnmanagedContent } from "../../../features/unmanaged-content/unmanagedContent.model.js";
import { deleteIllust } from "../../../src/main/apis/illusts/illust.delete.api.js";
import { registerIllust } from "../../../src/main/apis/illusts/illust.register.api.js";
import type { Context } from "../../../src/main/context.js";
import { depend } from "../../../src/main/di/dependencies.js";
import { TOKENS } from "../../../src/main/di/token.js";
import {
	createTestDatabase,
	createTestProjectContext,
} from "../../helpers/createTestDatabase.js";
import { testLogger } from "../../helpers/testlogger.js";
import { createTestIpcMainInvokeEvent } from "../testIpcMainInvokeEvent.js";
import { TestJobQueue } from "../testjobqueue.js";

const CATEGORY_NAME = "illust-delete-api";

describe("イラスト削除API", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it.skip("イラストを正常に削除できる", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.delete.success.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();
		const cache = new Map<string, UnmanagedContent>();

		// テスト用の画像を登録
		cache.set("delete-resource-1", {
			id: "delete-resource-1",
			path: "tests/api/datas/test-image-1.jpg",
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
		container.register(TOKENS.PROJECT_CONTEXT, () =>
			createTestProjectContext(),
		);

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// イラストを登録
		await registerIllust(context, {
			resourceIds: ["delete-resource-1"],
			rawTags: "delete-test tag1",
		});
		await testJobQueue.waitForCompletion();

		const registerSuccess = testJobQueue.successCallbacks[0];
		assert.ok(registerSuccess, "イラスト登録が成功しているべき");
		const registeredIllust = registerSuccess.value as Illust;

		// イラストを削除
		const result = await deleteIllust(context, {
			illustId: registeredIllust.id,
		});

		// 検証
		assert.equal(result.success, true, "削除が成功するべき");

		// イラストが削除されていることを確認
		const illustRepository = container.get(TOKENS.ILLUST_REPOSITORY);
		const deletedIllust = await illustRepository.findById(registeredIllust.id);
		assert.equal(deletedIllust, null, "イラストが削除されているべき");
	});

	it("存在しないイラストIDで削除を試みるとエラーが発生", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.delete.notfound.test",
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
		container.register(TOKENS.PROJECT_CONTEXT, () =>
			createTestProjectContext(),
		);

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// 存在しないIDで削除を試みる
		await assert.rejects(
			async () => {
				await deleteIllust(context, {
					illustId: "non-existing-illust-id",
				});
			},
			(error: Error) => {
				assert.match(
					error.message,
					/Illust not found/,
					"エラーメッセージに 'Illust not found' が含まれるべき",
				);
				return true;
			},
			"存在しないイラストIDで削除するとエラーが発生するべき",
		);
	});

	it("空のイラストIDでバリデーションエラーが発生", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.delete.validation.test",
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
		container.register(TOKENS.PROJECT_CONTEXT, () =>
			createTestProjectContext(),
		);

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// 空のIDで削除を試みる - zodスキーマは空文字を許可するが、実際には存在しないのでエラー
		await assert.rejects(
			async () => {
				await deleteIllust(context, {
					illustId: "",
				});
			},
			Error,
			"空のIDでの削除はエラーが発生するべき",
		);
	});
});
