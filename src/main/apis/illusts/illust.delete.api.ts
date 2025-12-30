import { z } from "zod";
import { zodValidator } from "../../../../features/shared/validation/index.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const deleteIllustSchema = z.object({
	illustId: z.string(),
});
export type DeleteIllustRequest = z.infer<typeof deleteIllustSchema>;

export const deleteIllustValidator = zodValidator(deleteIllustSchema);

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

	const { illustId } = request;

	// イラストを削除
	const success = await illustAction.delete(illustId);

	if (!success) {
		throw new Error("Illust not found");
	}

	return {
		success,
	};
}
