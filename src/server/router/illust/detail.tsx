import { z } from "zod";
import { TOKENS } from "../../../main/depend.injection.js";
import { factory } from "../../factory.js";
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

	return c.render(<IllustDetailPage illust={illust} />, {
		title: `イラスト詳細 - ${illustId}`,
	});
});

export default app;
