import { strict as assert } from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import { Container } from "../../../features/shared/container/index.js";
import { ValidError } from "../../../features/shared/error/valid/index.js";
import type { UnmanagedContent } from "../../../features/unmanaged-content/unmanagedContent.model.js";
import { registerIllust } from "../../../src/main/apis/illusts/illust.register.api.js";
import {
	searchIllust,
	searchIllustValidator,
} from "../../../src/main/apis/illusts/illust.search.api.js";
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

const CATEGORY_NAME = "illust-search-api";

describe("イラスト検索API", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("イラストを検索し、デフォルトのページングで結果を取得", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.search.basic.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();
		const cache = new Map<string, UnmanagedContent>();

		// テスト用の画像を登録
		cache.set("search-resource-1", {
			id: "search-resource-1",
			path: "tests/api/datas/test-image-1.jpg",
		});
		cache.set("search-resource-2", {
			id: "search-resource-2",
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

		// テスト用のイラストを2つ登録
		await registerIllust(context, {
			resourceIds: ["search-resource-1"],
			rawTags: "tag1 tag2",
		});
		await testJobQueue.waitForCompletion();

		await registerIllust(context, {
			resourceIds: ["search-resource-2"],
			rawTags: "tag2 tag3",
		});
		await testJobQueue.waitForCompletion();

		// 検索を実行（デフォルトパラメータ）
		const result = await searchIllust(context, {
			page: 1,
			limit: 20,
			sortBy: "id",
			order: "desc",
		});

		// 検証
		assert.equal(result.total, 2, "合計2件のイラストが登録されているべき");
		assert.equal(result.items.length, 2, "2件のイラストが返されるべき");
		assert.equal(result.page, 1, "ページ番号は1であるべき");
		assert.equal(result.limit, 20, "リミットは20であるべき");
		assert.equal(result.hasNext, false, "次のページはないべき");
		assert.equal(result.hasPrev, false, "前のページはないべき");
	});

	it("タグでイラストを検索し、結果を取得", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.search.tag.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();
		const cache = new Map<string, UnmanagedContent>();

		// テスト用の画像を登録
		cache.set("search-tag-resource-1", {
			id: "search-tag-resource-1",
			path: "tests/api/datas/test-image-1.jpg",
		});
		cache.set("search-tag-resource-2", {
			id: "search-tag-resource-2",
			path: "tests/api/datas/test-image-2.jpg",
		});
		cache.set("search-tag-resource-3", {
			id: "search-tag-resource-3",
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
		container.register(TOKENS.PROJECT_PATH, () => getTestProjectPath());

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// テスト用のイラストを3つ登録
		await registerIllust(context, {
			resourceIds: ["search-tag-resource-1"],
			rawTags: "landscape nature",
		});
		await testJobQueue.waitForCompletion();

		await registerIllust(context, {
			resourceIds: ["search-tag-resource-2"],
			rawTags: "portrait people",
		});
		await testJobQueue.waitForCompletion();

		await registerIllust(context, {
			resourceIds: ["search-tag-resource-3"],
			rawTags: "landscape city",
		});
		await testJobQueue.waitForCompletion();

		// "landscape" タグで検索
		const result = await searchIllust(context, {
			keyword: "landscape",
			page: 1,
			limit: 20,
			sortBy: "id",
			order: "desc",
		});

		// 検証
		assert.equal(
			result.total,
			2,
			"landscape タグを持つイラストは2件であるべき",
		);
		assert.equal(result.items.length, 2, "2件のイラストが返されるべき");

		// 各イラストに landscape タグが含まれることを確認
		for (const illust of result.items) {
			const hasLandscapeTag = illust.tags.some(
				(tag) => tag.name === "landscape",
			);
			assert.ok(
				hasLandscapeTag,
				`イラスト ${illust.id} は landscape タグを持つべき`,
			);
		}
	});

	it("ページングが正しく動作し、hasNext と hasPrev が正しく設定される", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.search.paging.test",
		);

		// TestJobQueueを作成
		const testJobQueue = new TestJobQueue();
		const cache = new Map<string, UnmanagedContent>();

		// テスト用の画像を5つ登録
		for (let i = 1; i <= 5; i++) {
			cache.set(`paging-resource-${i}`, {
				id: `paging-resource-${i}`,
				path: "tests/api/datas/test-image-1.jpg",
			});
		}

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

		// テスト用のイラストを5つ登録
		for (let i = 1; i <= 5; i++) {
			await registerIllust(context, {
				resourceIds: [`paging-resource-${i}`],
				rawTags: "test",
			});
			await testJobQueue.waitForCompletion();
		}

		// 1ページ目を取得（limit=2）
		const page1 = await searchIllust(context, {
			page: 1,
			limit: 2,
			sortBy: "id",
			order: "desc",
		});

		assert.equal(page1.total, 5, "合計5件のイラストが登録されているべき");
		assert.equal(page1.items.length, 2, "1ページ目は2件であるべき");
		assert.equal(page1.page, 1, "ページ番号は1であるべき");
		assert.equal(page1.hasNext, true, "次のページがあるべき");
		assert.equal(page1.hasPrev, false, "前のページはないべき");

		// 2ページ目を取得
		const page2 = await searchIllust(context, {
			page: 2,
			limit: 2,
			sortBy: "id",
			order: "desc",
		});

		assert.equal(page2.items.length, 2, "2ページ目は2件であるべき");
		assert.equal(page2.page, 2, "ページ番号は2であるべき");
		assert.equal(page2.hasNext, true, "次のページがあるべき");
		assert.equal(page2.hasPrev, true, "前のページがあるべき");

		// 3ページ目を取得
		const page3 = await searchIllust(context, {
			page: 3,
			limit: 2,
			sortBy: "id",
			order: "desc",
		});

		assert.equal(page3.items.length, 1, "3ページ目は1件であるべき");
		assert.equal(page3.page, 3, "ページ番号は3であるべき");
		assert.equal(page3.hasNext, false, "次のページはないべき");
		assert.equal(page3.hasPrev, true, "前のページがあるべき");
	});

	it("検索結果が0件の場合、空の配列が返される", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.search.empty.test",
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

		// 検索を実行（イラストが1件も登録されていない状態）
		const result = await searchIllust(context, {
			page: 1,
			limit: 20,
			sortBy: "id",
			order: "desc",
		});

		// 検証
		assert.equal(result.total, 0, "合計件数は0であるべき");
		assert.equal(result.items.length, 0, "結果は空の配列であるべき");
		assert.equal(result.page, 1, "ページ番号は1であるべき");
		assert.equal(result.hasNext, false, "次のページはないべき");
		assert.equal(result.hasPrev, false, "前のページはないべき");
	});

	it("不正なページ番号（0以下）でバリデーションエラーが発生", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.search.invalid-page.test",
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
				searchIllustValidator(
					{
						page: 0,
						limit: 20,
						sortBy: "id",
						order: "desc",
					},
					context,
				);
			},
			ValidError,
			"page が 0 の場合はValidErrorが発生すべき",
		);
	});

	it("不正なリミット（101以上）でバリデーションエラーが発生", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.search.invalid-limit.test",
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
				searchIllustValidator(
					{
						page: 1,
						limit: 101,
						sortBy: "id",
						order: "desc",
					},
					context,
				);
			},
			ValidError,
			"limit が 101 の場合はValidErrorが発生すべき",
		);
	});
});
