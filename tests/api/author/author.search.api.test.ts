import assert from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import { Container } from "../../../features/shared/container/index.js";
import {
	AUTHORS,
	VIDEOS,
	VIDEOS_AUTHORS,
} from "../../../features/shared/database/application/schema.js";
import { searchAuthor } from "../../../src/main/apis/authors/author.search.api.js";
import { depend } from "../../../src/main/di/dependencies.js";
import { TOKENS } from "../../../src/main/di/token.js";
import { createTestDatabase } from "../../helpers/createTestDatabase.js";
import { testLogger } from "../../helpers/testlogger.js";
import { createTestIpcMainInvokeEvent } from "../testIpcMainInvokeEvent.js";

const CATEGORY_NAME = "author-search-api";

describe("作者検索API", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it("作者を空文字で検索した場合、すべて検索できること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.search.all.test",
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
			id: "1",
			name: "作者A",
			urls: { twitter: "https://twitter.com/a" },
		});
		await database.insert(AUTHORS).values({
			id: "2",
			name: "作者B",
			urls: { youtube: "https://youtube.com/@b" },
		});
		await database.insert(AUTHORS).values({
			id: "3",
			name: "作者C",
			urls: {},
		});

		// ビデオデータ
		await database.insert(VIDEOS).values({ id: "v1" });
		await database.insert(VIDEOS).values({ id: "v2" });
		await database.insert(VIDEOS).values({ id: "v3" });

		// 作者とビデオの関連
		await database
			.insert(VIDEOS_AUTHORS)
			.values({ videoId: "v1", authorId: "1" });
		await database
			.insert(VIDEOS_AUTHORS)
			.values({ videoId: "v2", authorId: "1" });
		await database
			.insert(VIDEOS_AUTHORS)
			.values({ videoId: "v3", authorId: "2" });

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			name: undefined,
			page: 1,
			size: 20,
		};

		// 実行
		const response = await searchAuthor(context, request);

		// 検証
		assert.equal(response.count, 3);
		assert.equal(response.page, 1);
		assert.equal(response.size, 20);

		const authors = response.result;
		assert.equal(authors.length, 3);

		// 作者Aの検証
		const authorA = authors.find((a) => a.id === "1");
		assert.ok(authorA, "作者Aが存在すること");
		if (!authorA) throw new Error("作者Aが見つかりません");
		assert.equal(authorA.name, "作者A");
		assert.equal(authorA.videoCount, 2);
		assert.deepEqual(authorA.urls, { twitter: "https://twitter.com/a" });

		// 作者Bの検証
		const authorB = authors.find((a) => a.id === "2");
		assert.ok(authorB, "作者Bが存在すること");
		if (!authorB) throw new Error("作者Bが見つかりません");
		assert.equal(authorB.name, "作者B");
		assert.equal(authorB.videoCount, 1);
		assert.deepEqual(authorB.urls, { youtube: "https://youtube.com/@b" });

		// 作者Cの検証
		const authorC = authors.find((a) => a.id === "3");
		assert.ok(authorC, "作者Cが存在すること");
		if (!authorC) throw new Error("作者Cが見つかりません");
		assert.equal(authorC.name, "作者C");
		assert.equal(authorC.videoCount, 0);
		assert.deepEqual(authorC.urls, {});
	});

	it("作者名で部分一致検索できること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.search.name.test",
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
			id: "1",
			name: "山田太郎",
			urls: {},
		});
		await database.insert(AUTHORS).values({
			id: "2",
			name: "田中花子",
			urls: {},
		});
		await database.insert(AUTHORS).values({
			id: "3",
			name: "佐藤次郎",
			urls: {},
		});

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			name: "田",
			page: 1,
			size: 20,
		};

		// 実行
		const response = await searchAuthor(context, request);

		// 検証
		assert.equal(response.count, 2);
		assert.equal(response.result.length, 2);

		const authorNames = response.result.map((a) => a.name);
		assert.ok(authorNames.includes("山田太郎"));
		assert.ok(authorNames.includes("田中花子"));
		assert.ok(!authorNames.includes("佐藤次郎"));
	});

	it("ページネーションが正しく動作すること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.search.pagination.test",
		);

		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		container.register(TOKENS.DATABASE, () => database);

		// 10人の作者を作成
		for (let i = 1; i <= 10; i++) {
			await database.insert(AUTHORS).values({
				id: `${i}`,
				name: `作者${i}`,
				urls: {},
			});
		}

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};

		// ページ1（サイズ3）
		const request1 = {
			name: undefined,
			page: 1,
			size: 3,
		};
		const response1 = await searchAuthor(context, request1);

		assert.equal(response1.count, 10);
		assert.equal(response1.page, 1);
		assert.equal(response1.size, 3);
		assert.equal(response1.result.length, 3);

		// ページ2（サイズ3）
		const request2 = {
			name: undefined,
			page: 2,
			size: 3,
		};
		const response2 = await searchAuthor(context, request2);

		assert.equal(response2.count, 10);
		assert.equal(response2.page, 2);
		assert.equal(response2.size, 3);
		assert.equal(response2.result.length, 3);

		// ページ1とページ2で異なる作者が返ることを確認
		const page1Ids = response1.result.map((a) => a.id);
		const page2Ids = response2.result.map((a) => a.id);
		const hasOverlap = page1Ids.some((id) => page2Ids.includes(id));
		assert.ok(!hasOverlap, "ページ1とページ2で重複する作者がないこと");
	});

	it("該当する作者がいない場合、空の結果が返ること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"author.search.empty.test",
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
			id: "1",
			name: "山田太郎",
			urls: {},
		});

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			name: "存在しない作者",
			page: 1,
			size: 20,
		};

		// 実行
		const response = await searchAuthor(context, request);

		// 検証
		assert.equal(response.count, 0);
		assert.equal(response.result.length, 0);
	});
});
