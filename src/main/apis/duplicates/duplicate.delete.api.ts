import { z } from "zod";
import { zodValidator } from "../../../../features/shared/validation/index.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const deleteDuplicateGroupSchema = z.object({
	groupId: z.string(),
});
export type DeleteDuplicateGroupRequest = z.infer<
	typeof deleteDuplicateGroupSchema
>;

export const deleteDuplicateGroupValidator = zodValidator(
	deleteDuplicateGroupSchema,
);

export async function deleteDuplicateGroup(
	ctx: Context,
	request: DeleteDuplicateGroupRequest,
) {
	const { container } = ctx;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.DUPLICATE_CONTENT_REPOSITORY,
	);
	logger.info("delete duplicate group", request);

	await repository.delete(request.groupId);
	return { success: true };
}
