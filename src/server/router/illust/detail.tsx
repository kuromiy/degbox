import { z } from "zod";
import { TOKENS } from "../../../main/depend.injection.js";
import { factory } from "../../factory.js";
import { convertIllustContentPathsToUrls } from "../../helpers/illust.helper.js";
import IllustDetailPage from "../../view/pages/illust.detail.page.js";

export const detailIllustSchema = z.object({
	illustId: z.string().uuid(),
});
export type DetailIllustRequest = z.infer<typeof detailIllustSchema>;

const app = factory.createApp();

app.get("/detail/:illustId", async (c) => {
	const { container } = c.var;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.ILLUST_REPOSITORY,
	);

	const illustId = c.req.param("illustId");
	const parsedParams = detailIllustSchema.safeParse({ illustId });

	if (!parsedParams.success) {
		logger.warn("Invalid illust ID", parsedParams.error);
		return c.render(
			<div>
				<h1>エラー</h1>
				<p>無効なイラストIDです</p>
			</div>,
			{ title: "エラー" },
		);
	}

	logger.info("detail illust", { illustId });

	const illust = await repository.findById(illustId);
	if (!illust) {
		logger.warn(`Illust not found: ${illustId}`);
		return c.render(
			<div>
				<h1>エラー</h1>
				<p>イラストが見つかりませんでした</p>
			</div>,
			{ title: "エラー" },
		);
	}

	// datasource層から取得したパスを完全URLに変換
	const illustWithUrls = convertIllustContentPathsToUrls(illust);

	// ユーザーフレンドリーなタイトルを生成
	let descriptiveTitle = "詳細";

	// 最初の3つのタグ名を使用
	if (illustWithUrls.tags.length > 0) {
		const tagNames = illustWithUrls.tags.slice(0, 3).map((tag) => tag.name);
		descriptiveTitle = tagNames.join("、");
	}
	// タグがない場合は著者名を使用
	else if (illustWithUrls.authors.length > 0) {
		const authorNames = illustWithUrls.authors
			.slice(0, 2)
			.map((author) => author.name);
		descriptiveTitle = authorNames.join("、");
	}

	return c.render(<IllustDetailPage illust={illustWithUrls} />, {
		title: `イラスト詳細 - ${descriptiveTitle}`,
	});
});

// 削除エンドポイント
app.post("/detail/:illustId/delete", async (c) => {
	const { container } = c.var;
	const [logger, illustAction] = container.get(
		TOKENS.LOGGER,
		TOKENS.ILLUST_ACTION,
	);

	const illustId = c.req.param("illustId");
	const parsedParams = detailIllustSchema.safeParse({ illustId });

	if (!parsedParams.success) {
		logger.warn("Invalid illust ID for delete", parsedParams.error);
		return c.json({ success: false, error: "無効なイラストIDです" }, 400);
	}

	logger.info("delete illust", { illustId });

	const success = await illustAction.delete(illustId);

	if (!success) {
		logger.warn(`Illust not found for delete: ${illustId}`);
		return c.json(
			{ success: false, error: "イラストが見つかりませんでした" },
			404,
		);
	}

	return c.json({ success: true });
});

export default app;
