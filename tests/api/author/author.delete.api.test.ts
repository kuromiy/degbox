import assert from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import { eq } from "drizzle-orm";
import { Container } from "../../../features/shared/container/index.js";
import {
	AUTHORS,
	VIDEOS,
	VIDEOS_AUTHORS,
} from "../../../features/shared/database/schema.js";
import { deleteAuthor } from "../../../src/main/apis/authors/author.delete.api.js";
import { depend, TOKENS } from "../../../src/main/depend.injection.js";
import { createTestDatabase } from "../../helpers/createTestDatabase.js";
import { testLogger } from "../../helpers/testlogger.js";
import { createTestIpcMainInvokeEvent } from "../testIpcMainInvokeEvent.js";

const CATEGORY_NAME = "author-delete-api";

describe("作者削除API", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("作者を削除できること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.delete.basic.test",
		);

		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.DATABASE, () => database);

		// 作者データ
		await database.insert(AUTHORS).values({
			id: "author1",
			name: "削除対象作者",
			urls: { twitter: "https://twitter.com/test" },
		});

		// 削除前に作者が存在することを確認
		const beforeAuthors = await database
			.select()
			.from(AUTHORS)
			.where(eq(AUTHORS.id, "author1"));
		assert.equal(beforeAuthors.length, 1);

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			id: "author1",
		};

		// 実行
		const response = await deleteAuthor(context, request);

		// 検証
		assert.equal(response.success, true);

		// 削除後に作者が存在しないことを確認
		const afterAuthors = await database
			.select()
			.from(AUTHORS)
			.where(eq(AUTHORS.id, "author1"));
		assert.equal(afterAuthors.length, 0);
	});

	it("作者削除時に動画との紐付けも削除されること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.delete.relations.test",
		);

		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.DATABASE, () => database);

		// 作者データ
		await database.insert(AUTHORS).values({
			id: "author1",
			name: "削除対象作者",
			urls: {},
		});

		// ビデオデータ
		await database.insert(VIDEOS).values({ id: "v1" });
		await database.insert(VIDEOS).values({ id: "v2" });

		// 作者とビデオの関連
		await database
			.insert(VIDEOS_AUTHORS)
			.values({ videoId: "v1", authorId: "author1" });
		await database
			.insert(VIDEOS_AUTHORS)
			.values({ videoId: "v2", authorId: "author1" });

		// 削除前に関連が存在することを確認
		const beforeRelations = await database
			.select()
			.from(VIDEOS_AUTHORS)
			.where(eq(VIDEOS_AUTHORS.authorId, "author1"));
		assert.equal(beforeRelations.length, 2);

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			id: "author1",
		};

		// 実行
		const response = await deleteAuthor(context, request);

		// 検証
		assert.equal(response.success, true);

		// 削除後に関連も削除されていることを確認
		const afterRelations = await database
			.select()
			.from(VIDEOS_AUTHORS)
			.where(eq(VIDEOS_AUTHORS.authorId, "author1"));
		assert.equal(afterRelations.length, 0);

		// 動画自体は削除されていないことを確認
		const videos = await database.select().from(VIDEOS);
		assert.equal(videos.length, 2);
	});

	it("存在しない作者IDの場合、エラーが発生すること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.delete.notfound.test",
		);

		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.DATABASE, () => database);

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			id: "non-existent",
		};

		// 実行と検証
		await assert.rejects(
			async () => {
				await deleteAuthor(context, request);
			},
			{
				message: "Author not found",
			},
		);
	});

	it("複数の作者がいる場合、指定した作者のみ削除されること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.delete.selective.test",
		);

		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.DATABASE, () => database);

		// 作者データ
		await database.insert(AUTHORS).values({
			id: "author1",
			name: "削除対象作者",
			urls: {},
		});
		await database.insert(AUTHORS).values({
			id: "author2",
			name: "残す作者",
			urls: {},
		});
		await database.insert(AUTHORS).values({
			id: "author3",
			name: "残す作者2",
			urls: {},
		});

		// 削除前に3人存在することを確認
		const beforeAuthors = await database.select().from(AUTHORS);
		assert.equal(beforeAuthors.length, 3);

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			id: "author1",
		};

		// 実行
		const response = await deleteAuthor(context, request);

		// 検証
		assert.equal(response.success, true);

		// 削除後に2人残っていることを確認
		const afterAuthors = await database.select().from(AUTHORS);
		assert.equal(afterAuthors.length, 2);

		// 削除された作者が存在しないことを確認
		const deletedAuthor = await database
			.select()
			.from(AUTHORS)
			.where(eq(AUTHORS.id, "author1"));
		assert.equal(deletedAuthor.length, 0);

		// 残っている作者が正しいことを確認
		const remainingAuthorIds = afterAuthors.map((a) => a.id);
		assert.ok(remainingAuthorIds.includes("author2"));
		assert.ok(remainingAuthorIds.includes("author3"));
		assert.ok(!remainingAuthorIds.includes("author1"));
	});
});
