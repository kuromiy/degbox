import assert from "node:assert";
import { rm } from "node:fs/promises";
import { before, describe, it } from "node:test";
import { Container } from "../../features/shared/container/index.js";
import {
	TAG_COOCCURRENCES,
	TAGS,
} from "../../features/shared/database/schema.js";
import { suggestRelatedTags } from "../../src/main/apis/tags/tag.suggest.api.js";
import { depend, TOKENS } from "../../src/main/depend.injection.js";
import { createTestDatabase } from "../helpers/createTestDatabase.js";
import { createTestIpcMainInvokeEvent } from "./testIpcMainInvokeEvent.js";

describe("タグ提案API", () => {
	before(async () => {
		await rm("./tests/db", { recursive: true, force: true });
	});

	it("既存のタグに基づいて関連タグが提案されること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase("tag.suggest.test");

		// 事前データ
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container.register(token, provider);
		});
		// データベースインスタンスを上書き
		container.register(TOKENS.DATABASE, () => database);

		// タグの作成
		await database.insert(TAGS).values({ id: "1", name: "basketball" });
		await database.insert(TAGS).values({ id: "2", name: "soccer" });
		await database.insert(TAGS).values({ id: "3", name: "baseball" });
		await database.insert(TAGS).values({ id: "4", name: "sports" });

		// タグ共起行列の作成
		// basketball と sports が共起
		await database
			.insert(TAG_COOCCURRENCES)
			.values({ tag1Id: "1", tag2Id: "4", count: 5 });

		// basketball と baseball が共起
		await database
			.insert(TAG_COOCCURRENCES)
			.values({ tag1Id: "1", tag2Id: "3", count: 3 });

		// soccer と sports が共起
		await database
			.insert(TAG_COOCCURRENCES)
			.values({ tag1Id: "2", tag2Id: "4", count: 4 });

		// 準備
		const mockEvent = createTestIpcMainInvokeEvent();
		const context = {
			container,
			event: mockEvent,
		};
		const request = {
			tagNames: ["basketball"],
			limit: 5,
		};

		// 実行
		const response = await suggestRelatedTags(context, request);

		// 検証
		// basketballと共起するタグ: sports(count=5), baseball(count=3)
		assert.ok(response.length > 0, "関連タグが提案されること");

		// 提案されたタグのIDを確認
		const suggestedTagIds = response.map((suggestion) => suggestion.tag.id);

		// sports または baseball が含まれていることを確認
		const hasSportsOrBaseball =
			suggestedTagIds.includes("4") || // sports
			suggestedTagIds.includes("3"); // baseball

		assert.ok(hasSportsOrBaseball, "basketballと共起するタグが提案されること");
	});
});
