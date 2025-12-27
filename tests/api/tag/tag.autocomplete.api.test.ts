import assert from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import { Container } from "../../../features/shared/container/index.js";
import { TAGS } from "../../../features/shared/database/application/schema.js";
import { autocompleteTags } from "../../../src/main/apis/tags/tag.autocomplete.api.js";
import { depend } from "../../../src/main/di/dependencies.js";
import { TOKENS } from "../../../src/main/di/token.js";
import { createTestDatabase } from "../../helpers/createTestDatabase.js";
import { testLogger } from "../../helpers/testlogger.js";
import { createTestIpcMainInvokeEvent } from "../testIpcMainInvokeEvent.js";

const CATEGORY_NAME = "tag-autocomplete-api";

describe("タグ自動補完API", () => {
	before(async () => {
		await rm("./tests/db/tag.autocomplete.api", {
			recursive: true,
			force: true,
		});
	});

	it("空文字で実効した場合、", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"tag.autocomplete.test",
		);

		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		// データベースインスタンスを上書き
		container.register(TOKENS.DATABASE, () => database);

		// タグ
		await database.insert(TAGS).values({ id: "1", name: "basketball" });
		await database.insert(TAGS).values({ id: "2", name: "soccer" });
		await database.insert(TAGS).values({ id: "3", name: "baseball" });

		//準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			value: "",
			limit: 5,
		};

		// 実行
		const response = await autocompleteTags(context, request);

		// 検証
		assert.equal(response.length, 0);
	});

	it("意図したタグが取得できること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"tag.autocomplete.test",
		);
		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		// データベースインスタンスを上書き
		container.register(TOKENS.DATABASE, () => database);

		// タグ
		await database.insert(TAGS).values({ id: "1", name: "basketball" });
		await database.insert(TAGS).values({ id: "2", name: "soccer" });
		await database.insert(TAGS).values({ id: "3", name: "baseball" });

		//準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			value: "s",
			limit: 5,
		};

		// 実行
		const response = await autocompleteTags(context, request);

		// 検証
		assert.equal(response.length, 1);

		const tag = response[0];
		assert.ok(tag);
		assert.equal(tag.id, "2");
		assert.equal(tag.name, "soccer");
	});

	it("意図したタグが取得できること2", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"tag.autocomplete.test",
		);

		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		container.register(TOKENS.LOGGER, () => testLogger);
		// データベースインスタンスを上書き
		container.register(TOKENS.DATABASE, () => database);

		// タグ
		await database.insert(TAGS).values({ id: "1", name: "basketball" });
		await database.insert(TAGS).values({ id: "2", name: "soccer" });
		await database.insert(TAGS).values({ id: "3", name: "baseball" });

		//準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			value: "ba",
			limit: 5,
		};

		// 実行
		const response = await autocompleteTags(context, request);

		// 検証
		assert.equal(response.length, 2);

		const tag1 = response[0];
		assert.ok(tag1);
		assert.equal(tag1.id, "1");
		assert.equal(tag1.name, "basketball");

		const tag2 = response[1];
		assert.ok(tag2);
		assert.equal(tag2.id, "3");
		assert.equal(tag2.name, "baseball");
	});
});
