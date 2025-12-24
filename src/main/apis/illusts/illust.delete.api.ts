import { z } from "zod";
import type { Context } from "../../context.js";
import { TOKENS } from "../../depend.injection.js";

export const deleteIllustSchema = z.object({
	illustId: z.string(),
});
export type DeleteIllustRequest = z.infer<typeof deleteIllustSchema>;

export interface DeleteIllustResponse {
	success: boolean;
}

export async function deleteIllust(
	ctx: Context,
	request: DeleteIllustRequest,
): Promise<DeleteIllustResponse> {
	const { container } = ctx;
	const [logger, illustAction] = container.get(
		TOKENS.LOGGER,
		TOKENS.ILLUST_ACTION,
	);

	logger.info("delete illust", request);
	const valid = deleteIllustSchema.safeParse(request);
	if (!valid.success) {
		logger.warn("Invalid request", valid.error);
		throw new Error("Invalid request");
	}

	const { illustId } = valid.data;

	// イラストを削除
	const success = await illustAction.delete(illustId);

	if (!success) {
		throw new Error("Illust not found");
	}

	return {
		success,
	};
}
