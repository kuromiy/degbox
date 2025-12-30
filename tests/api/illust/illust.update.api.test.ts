import { strict as assert } from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import type { Illust } from "../../../features/illust/illust.model.js";
import { Container } from "../../../features/shared/container/index.js";
import { ValidError } from "../../../features/shared/error/valid/index.js";
import type { UnmanagedContent } from "../../../features/unmanaged-content/unmanagedContent.model.js";
import { registerIllust } from "../../../src/main/apis/illusts/illust.register.api.js";
import {
	updateIllust,
	updateIllustValidator,
} from "../../../src/main/apis/illusts/illust.update.api.js";
import type { Context } from "../../../src/main/context.js";
import { depend } from "../../../src/main/di/dependencies.js";
import { TOKENS } from "../../../src/main/di/token.js";
import {
	createTestDatabase,
	getTestProjectPath,
} from "../../helpers/createTestDatabase.js";
import { testLogger } from "../../helpers/testlogger.js";
import { createTestIpcMainInvokeEvent } from "../testIpcMainInvokeEvent.js";
import { TestJobQueue } from "../testjobqueue.js";

const CATEGORY_NAME = "illust-update-api";

describe("イラスト更新API", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("既存画像のみでイラストを正常に更新", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.update.existing.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();
		const cache = new Map<string, UnmanagedContent>();

		// テスト用の画像を登録
		cache.set("update-resource-1", {
			id: "update-resource-1",
			path: "tests/api/datas/test-image-1.jpg",
		});
		cache.set("update-resource-2", {
			id: "update-resource-2",
			path: "tests/api/datas/test-image-2.jpg",
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
		container.register(TOKENS.PROJECT_PATH, () => getTestProjectPath());

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// イラストを登録
		await registerIllust(context, {
			resourceIds: ["update-resource-1", "update-resource-2"],
			rawTags: "original tag1",
		});
		await testJobQueue.waitForCompletion();

		const registerSuccess = testJobQueue.successCallbacks[0];
		assert.ok(registerSuccess, "イラスト登録が成功しているべき");
		const registeredIllust = registerSuccess.value as Illust;

		// TestJobQueueをリセット
		testJobQueue.reset();

		// イラストを更新（既存画像の順序を逆にする）
		const content1Id = registeredIllust.contents[0]?.content.id;
		const content2Id = registeredIllust.contents[1]?.content.id;
		assert.ok(content1Id, "コンテンツ1のIDが存在するべき");
		assert.ok(content2Id, "コンテンツ2のIDが存在するべき");

		await updateIllust(context, {
			id: registeredIllust.id,
			tags: "updated tag1 tag2",
			imageItems: [`existing:${content2Id}`, `existing:${content1Id}`],
			authorIds: [],
		});
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

		const updateSuccess = testJobQueue.successCallbacks[0];
		assert.ok(updateSuccess, "更新成功コールバックが存在するべき");
		const updatedIllust = updateSuccess.value as Illust;

		// コンテンツの順序が逆になっていることを確認
		assert.equal(updatedIllust.contents.length, 2, "コンテンツは2つであるべき");
		assert.equal(
			updatedIllust.contents[0]?.content.id,
			content2Id,
			"1番目のコンテンツが入れ替わっているべき",
		);
		assert.equal(
			updatedIllust.contents[1]?.content.id,
			content1Id,
			"2番目のコンテンツが入れ替わっているべき",
		);

		// タグが更新されていることを確認
		assert.equal(updatedIllust.tags.length, 3, "タグは3つであるべき");
		const tagNames = updatedIllust.tags.map((t) => t.name);
		assert.ok(tagNames.includes("updated"), "updated タグが存在するべき");
		assert.ok(tagNames.includes("tag1"), "tag1 タグが存在するべき");
		assert.ok(tagNames.includes("tag2"), "tag2 タグが存在するべき");
	});

	it("新規画像を追加してイラストを更新", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.update.new.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();
		const cache = new Map<string, UnmanagedContent>();

		// テスト用の画像を登録
		cache.set("update-new-resource-1", {
			id: "update-new-resource-1",
			path: "tests/api/datas/test-image-1.jpg",
		});
		cache.set("update-new-resource-2", {
			id: "update-new-resource-2",
			path: "tests/api/datas/test-image-2.jpg",
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
		container.register(TOKENS.PROJECT_PATH, () => getTestProjectPath());

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// イラストを登録（1つの画像のみ）
		await registerIllust(context, {
			resourceIds: ["update-new-resource-1"],
			rawTags: "original",
		});
		await testJobQueue.waitForCompletion();

		const registerSuccess = testJobQueue.successCallbacks[0];
		assert.ok(registerSuccess, "イラスト登録が成功しているべき");
		const registeredIllust = registerSuccess.value as Illust;

		// TestJobQueueをリセット
		testJobQueue.reset();

		// イラストを更新（新規画像を追加）
		const existingContentId = registeredIllust.contents[0]?.content.id;
		assert.ok(existingContentId, "既存コンテンツのIDが存在するべき");

		await updateIllust(context, {
			id: registeredIllust.id,
			tags: "updated",
			imageItems: [
				`existing:${existingContentId}`,
				"new:update-new-resource-2",
			],
			authorIds: [],
		});
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

		const updateSuccess = testJobQueue.successCallbacks[0];
		assert.ok(updateSuccess, "更新成功コールバックが存在するべき");
		const updatedIllust = updateSuccess.value as Illust;

		// コンテンツが2つになっていることを確認
		assert.equal(updatedIllust.contents.length, 2, "コンテンツは2つであるべき");
		assert.equal(
			updatedIllust.contents[0]?.content.id,
			existingContentId,
			"1番目は既存コンテンツであるべき",
		);
		assert.ok(
			updatedIllust.contents[1]?.content.id,
			"2番目の新規コンテンツが存在するべき",
		);
	});

	it("作者を追加してイラストを更新", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.update.author.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();
		const cache = new Map<string, UnmanagedContent>();

		// テスト用の画像を登録
		cache.set("update-author-resource-1", {
			id: "update-author-resource-1",
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
		container.register(TOKENS.PROJECT_PATH, () => getTestProjectPath());

		// 作者を登録
		const authorRepository = container.get(TOKENS.AUTHOR_REPOSITORY);
		const author = await authorRepository.save({
			id: "update-test-author-id",
			name: "Update Test Author",
			urls: {},
		});

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// イラストを登録（作者なし）
		await registerIllust(context, {
			resourceIds: ["update-author-resource-1"],
			rawTags: "original",
		});
		await testJobQueue.waitForCompletion();

		const registerSuccess = testJobQueue.successCallbacks[0];
		assert.ok(registerSuccess, "イラスト登録が成功しているべき");
		const registeredIllust = registerSuccess.value as Illust;
		assert.equal(
			registeredIllust.authors.length,
			0,
			"初期状態では作者がいないべき",
		);

		// TestJobQueueをリセット
		testJobQueue.reset();

		// イラストを更新（作者を追加）
		const existingContentId = registeredIllust.contents[0]?.content.id;
		assert.ok(existingContentId, "既存コンテンツのIDが存在するべき");

		await updateIllust(context, {
			id: registeredIllust.id,
			tags: "updated",
			imageItems: [`existing:${existingContentId}`],
			authorIds: [author.id],
		});
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

		const updateSuccess = testJobQueue.successCallbacks[0];
		assert.ok(updateSuccess, "更新成功コールバックが存在するべき");
		const updatedIllust = updateSuccess.value as Illust;

		// 作者が追加されていることを確認
		assert.equal(updatedIllust.authors.length, 1, "作者が1人であるべき");
		assert.equal(
			updatedIllust.authors[0]?.id,
			author.id,
			"作者IDが一致するべき",
		);
	});

	it("存在しないイラストIDでエラーが発生", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.update.notfound.test",
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
		container.register(TOKENS.PROJECT_PATH, () => getTestProjectPath());

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// 存在しないIDで更新を試みる（エラーが発生することを期待）
		try {
			await updateIllust(context, {
				id: "non-existing-illust-id",
				tags: "test",
				imageItems: ["existing:some-content-id"],
				authorIds: [],
			});
			assert.fail("エラーが発生するべき");
		} catch (error) {
			assert.ok(error instanceof Error, "Errorインスタンスであるべき");
			assert.match(
				error.message,
				/Illust not found/,
				"エラーメッセージに 'Illust not found' が含まれるべき",
			);
		}

		// waitForCompletionでジョブの完了を待つ
		await testJobQueue.waitForCompletion();

		// エラーコールバックが呼ばれることを確認
		assert.equal(
			testJobQueue.errorCallbacks.length,
			1,
			"onError should be called",
		);
		assert.equal(
			testJobQueue.successCallbacks.length,
			0,
			"onSuccess should not be called",
		);
	});

	it("不正なimageItemsフォーマットでエラーが発生", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.update.invalid-format.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();
		const cache = new Map<string, UnmanagedContent>();

		// テスト用の画像を登録
		cache.set("update-invalid-resource-1", {
			id: "update-invalid-resource-1",
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
		container.register(TOKENS.PROJECT_PATH, () => getTestProjectPath());

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// イラストを登録
		await registerIllust(context, {
			resourceIds: ["update-invalid-resource-1"],
			rawTags: "test",
		});
		await testJobQueue.waitForCompletion();

		const registerSuccess = testJobQueue.successCallbacks[0];
		assert.ok(registerSuccess, "イラスト登録が成功しているべき");
		const registeredIllust = registerSuccess.value as Illust;

		// TestJobQueueをリセット
		testJobQueue.reset();

		// 不正なフォーマット（コロンなし）で更新を試みる（エラーが発生することを期待）
		try {
			await updateIllust(context, {
				id: registeredIllust.id,
				tags: "test",
				imageItems: ["invalid-format-without-colon"],
				authorIds: [],
			});
			assert.fail("エラーが発生するべき");
		} catch (error) {
			assert.ok(error instanceof Error, "Errorインスタンスであるべき");
			assert.match(
				error.message,
				/Invalid image item format/,
				"エラーメッセージに 'Invalid image item format' が含まれるべき",
			);
		}

		// waitForCompletionでジョブの完了を待つ
		await testJobQueue.waitForCompletion();

		// エラーコールバックが呼ばれることを確認
		assert.equal(
			testJobQueue.errorCallbacks.length,
			1,
			"onError should be called",
		);
		assert.equal(
			testJobQueue.successCallbacks.length,
			0,
			"onSuccess should not be called",
		);
	});

	it("存在しない作者IDでエラーが発生", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.update.author-notfound.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();
		const cache = new Map<string, UnmanagedContent>();

		// テスト用の画像を登録
		cache.set("update-author-notfound-resource-1", {
			id: "update-author-notfound-resource-1",
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
		container.register(TOKENS.PROJECT_PATH, () => getTestProjectPath());

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// イラストを登録
		await registerIllust(context, {
			resourceIds: ["update-author-notfound-resource-1"],
			rawTags: "test",
		});
		await testJobQueue.waitForCompletion();

		const registerSuccess = testJobQueue.successCallbacks[0];
		assert.ok(registerSuccess, "イラスト登録が成功しているべき");
		const registeredIllust = registerSuccess.value as Illust;

		// TestJobQueueをリセット
		testJobQueue.reset();

		// 存在しない作者IDで更新を試みる（エラーが発生することを期待）
		const existingContentId = registeredIllust.contents[0]?.content.id;
		assert.ok(existingContentId, "既存コンテンツのIDが存在するべき");

		try {
			await updateIllust(context, {
				id: registeredIllust.id,
				tags: "test",
				imageItems: [`existing:${existingContentId}`],
				authorIds: ["non-existing-author-id"],
			});
			assert.fail("エラーが発生するべき");
		} catch (error) {
			assert.ok(error instanceof Error, "Errorインスタンスであるべき");
			assert.match(
				error.message,
				/Author with ID .* not found/,
				"エラーメッセージに作者が見つからないことが含まれるべき",
			);
		}

		// waitForCompletionでジョブの完了を待つ
		await testJobQueue.waitForCompletion();

		// エラーコールバックが呼ばれることを確認
		assert.equal(
			testJobQueue.errorCallbacks.length,
			1,
			"onError should be called",
		);
		assert.equal(
			testJobQueue.successCallbacks.length,
			0,
			"onSuccess should not be called",
		);
	});

	it("バリデーションエラー（空のID）が発生", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.update.validation.test",
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
		container.register(TOKENS.PROJECT_PATH, () => getTestProjectPath());

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// バリデータを直接呼び出してバリデーションエラーを検証
		assert.throws(
			() => {
				updateIllustValidator(
					{
						id: "",
						tags: "test",
						imageItems: ["existing:some-id"],
						authorIds: [],
					},
					context,
				);
			},
			ValidError,
			"空のIDの場合はValidErrorが発生すべき",
		);
	});
});
