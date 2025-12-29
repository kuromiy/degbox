import { strict as assert } from "node:assert";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { before, describe, it } from "node:test";
import { Container } from "../../../features/shared/container/index.js";
import { depend } from "../../../src/main/di/dependencies.js";
import { TOKENS } from "../../../src/main/di/token.js";
import { createServer } from "../../../src/server/server.js";
import { TestJobQueue } from "../../api/testjobqueue.js";
import {
	createTestDatabase,
	getTestProjectPath,
} from "../../helpers/createTestDatabase.js";
import { testLogger } from "../../helpers/testlogger.js";

const CATEGORY_NAME = "illust-delete-server";

describe("イラスト削除（サーバー）", () => {
	before(async () => {
		await rm(`./tests/db/${CATEGORY_NAME}`, { recursive: true, force: true });
	});

	it.skip("イラストを正常に削除できること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.delete.success.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		container?.register(TOKENS.PROJECT_PATH, () => getTestProjectPath());

		// 事前準備: イラストを登録
		const illustAction = container.get(TOKENS.ILLUST_ACTION);
		const contentAction = container.get(TOKENS.CONTENT_ACTION);
		const tagAction = container.get(TOKENS.TAG_ACTION);

		// テスト用の画像ファイルを準備
		const imagePath = join("tests", "api", "datas", "test-image-1.jpg");
		const imageBuffer = await readFile(imagePath);
		const fs = container.get(TOKENS.FILE_SYSTEM);

		// 画像を一時ファイルに保存してコンテンツ登録
		const tempPath = await fs.writeTempFile(imageBuffer, "jpg");
		const content = await contentAction.register(tempPath);

		// タグを作成
		const tags = await tagAction.getOrCreate(["delete-test"]);

		// イラストを作成
		const illust = await illustAction.register(tags, [content], []);

		const app = createServer({ container, fileRoot: process.cwd() });

		// 削除リクエスト送信
		const deleteRes = await app.request(`/illust/detail/${illust.id}/delete`, {
			method: "POST",
			headers: {
				Origin: "http://localhost",
			},
		});

		assert.equal(deleteRes.status, 200, "削除が成功すること");

		const responseBody = await deleteRes.json();
		assert.equal(
			responseBody.success,
			true,
			"レスポンスのsuccessがtrueであること",
		);

		// イラストが削除されていることを確認
		const illustRepository = container.get(TOKENS.ILLUST_REPOSITORY);
		const deletedIllust = await illustRepository.findById(illust.id);
		assert.equal(deletedIllust, null, "イラストが削除されていること");
	});

	it("存在しないイラストIDで404エラーが返ること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.delete.notfound.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		container?.register(TOKENS.PROJECT_PATH, () => getTestProjectPath());

		const app = createServer({ container, fileRoot: process.cwd() });

		// 存在しないUUID形式のIDで削除リクエスト送信
		const deleteRes = await app.request(
			"/illust/detail/00000000-0000-0000-0000-000000000000/delete",
			{
				method: "POST",
				headers: {
					Origin: "http://localhost",
				},
			},
		);

		assert.equal(deleteRes.status, 404, "404エラーが返ること");

		const responseBody = await deleteRes.json();
		assert.equal(
			responseBody.success,
			false,
			"レスポンスのsuccessがfalseであること",
		);
		assert.ok(responseBody.error, "エラーメッセージが存在すること");
	});

	it("不正なUUID形式のイラストIDで400エラーが返ること", async () => {
		// テスト用データベースを作成
		const database = await createTestDatabase(
			[CATEGORY_NAME],
			"illust.delete.invalid-uuid.test",
		);

		const testJobQueue = new TestJobQueue();
		const container = new Container();
		depend.forEach(({ token, provider }) => {
			container?.register(token, provider);
		});
		container?.register(TOKENS.DATABASE, () => database);
		container?.register(TOKENS.LOGGER, () => testLogger);
		container?.register(TOKENS.JOB_QUEUE, () => testJobQueue);
		container?.register(TOKENS.PROJECT_PATH, () => getTestProjectPath());

		const app = createServer({ container, fileRoot: process.cwd() });

		// 不正なUUID形式で削除リクエスト送信
		const deleteRes = await app.request(
			"/illust/detail/invalid-uuid-format/delete",
			{
				method: "POST",
				headers: {
					Origin: "http://localhost",
				},
			},
		);

		assert.equal(deleteRes.status, 400, "400エラーが返ること");

		const responseBody = await deleteRes.json();
		assert.equal(
			responseBody.success,
			false,
			"レスポンスのsuccessがfalseであること",
		);
		assert.ok(responseBody.error, "エラーメッセージが存在すること");
	});
});
