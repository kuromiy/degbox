import { z } from "zod";
import { zodValidator } from "../../../../features/shared/validation/index.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const removeItemFromGroupSchema = z.object({
	groupId: z.string(),
	contentId: z.string(),
});
export type RemoveItemFromGroupRequest = z.infer<
	typeof removeItemFromGroupSchema
>;

export const removeItemFromGroupValidator = zodValidator(
	removeItemFromGroupSchema,
);

export async function removeItemFromGroup(
	ctx: Context,
	request: RemoveItemFromGroupRequest,
) {
	const { container } = ctx;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.DUPLICATE_CONTENT_REPOSITORY,
	);
	logger.info("remove item from duplicate group", request);

	await repository.removeItemFromGroup(request.groupId, request.contentId);
	return { success: true };
}
