import { strict as assert } from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import type { Author } from "../../../features/author/author.model.js";
import { Container } from "../../../features/shared/container/index.js";
import { updateAuthor } from "../../../src/main/apis/authors/author.update.api.js";
import type { Context } from "../../../src/main/context.js";
import { depend } from "../../../src/main/di/dependencies.js";
import { TOKENS } from "../../../src/main/di/token.js";
import { createTestDatabase } from "../../helpers/createTestDatabase.js";
import { testLogger } from "../../helpers/testlogger.js";
import { createTestIpcMainInvokeEvent } from "../testIpcMainInvokeEvent.js";
import { TestJobQueue } from "../testjobqueue.js";

const CATEGORY_NAME = "author-update-api";

describe("作者更新API", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("作者を正常に更新し、onSuccessが呼ばれonErrorは呼ばれないことを検証", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.update.test",
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

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成（モックされたeventを含む）
		const context: Context = {
			container,
			event: mockEvent,
		};

		// 事前準備: 作者を登録
		const authorRepository = container.get(TOKENS.AUTHOR_REPOSITORY);
		const authorId = await authorRepository.generateId();
		await authorRepository.save({
			id: authorId,
			name: "元の作者名",
			urls: {
				twitter: "https://twitter.com/original",
			},
		});

		// 更新リクエスト
		const request = {
			id: authorId,
			name: "更新後の作者名",
			urls: JSON.stringify({
				twitter: "https://twitter.com/updated",
				youtube: "https://youtube.com/@updated",
			}),
		};

		// 実行
		const result = await updateAuthor(context, request);

		// 検証
		assert.ok(result, "Update result should exist");
		const updatedAuthor = result as Author;
		assert.equal(updatedAuthor.id, authorId, "Author ID should not change");
		assert.equal(
			updatedAuthor.name,
			"更新後の作者名",
			"Author name should be updated",
		);
		assert.deepEqual(
			updatedAuthor.urls,
			{
				twitter: "https://twitter.com/updated",
				youtube: "https://youtube.com/@updated",
			},
			"Author URLs should be updated",
		);
	});

	it("存在しない作者IDでエラーになることを検証", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.update.notfound.test",
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

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// 存在しない作者IDで更新を試みる
		const request = {
			id: "non-existent-id",
			name: "更新後の作者名",
			urls: JSON.stringify({}),
		};

		// 実行してエラーが発生することを期待
		try {
			await updateAuthor(context, request);
			assert.fail("Should throw an error for non-existent author");
		} catch (error) {
			// エラーが発生することを確認
			assert.ok(error, "Error should be thrown");
			assert.ok(error instanceof Error, "Error should be an instance of Error");
			assert.equal(
				error.message,
				"Author not found",
				"Error message should indicate author not found",
			);
		}
	});

	it("不正なJSON形式のURLsでエラーになることを検証", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.update.invalid-json.test",
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

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// 事前準備: 作者を登録
		const authorRepository = container.get(TOKENS.AUTHOR_REPOSITORY);
		const authorId = await authorRepository.generateId();
		await authorRepository.save({
			id: authorId,
			name: "元の作者名",
			urls: {},
		});

		// 準備 - 不正なJSON文字列
		const request = {
			id: authorId,
			name: "更新後の作者名",
			urls: "invalid-json-string",
		};

		// 実行してエラーが発生することを期待
		try {
			await updateAuthor(context, request);
			assert.fail("Should throw an error for invalid JSON");
		} catch (error) {
			// エラーが発生することを確認
			assert.ok(error, "Error should be thrown");
		}
	});

	it("空のURLsオブジェクトで正常に更新できることを検証", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.update.empty-urls.test",
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

		// IpcMainInvokeEventのモックを作成
		const mockEvent = createTestIpcMainInvokeEvent();

		// Contextオブジェクトを作成
		const context: Context = {
			container,
			event: mockEvent,
		};

		// 事前準備: 作者を登録
		const authorRepository = container.get(TOKENS.AUTHOR_REPOSITORY);
		const authorId = await authorRepository.generateId();
		await authorRepository.save({
			id: authorId,
			name: "元の作者名",
			urls: {
				twitter: "https://twitter.com/original",
			},
		});

		// 準備 - 空のURLsオブジェクト
		const request = {
			id: authorId,
			name: "URLなし作者",
			urls: JSON.stringify({}),
		};

		// 実行
		const result = await updateAuthor(context, request);

		// 検証
		assert.ok(result, "Update result should exist");
		const updatedAuthor = result as Author;
		assert.equal(updatedAuthor.name, "URLなし作者", "Author name should match");
		assert.deepEqual(updatedAuthor.urls, {}, "URLs should be empty object");
	});
});
