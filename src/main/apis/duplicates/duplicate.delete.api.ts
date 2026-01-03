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

export interface DeleteDuplicateGroupResponse {
	success: boolean;
}

export async function deleteDuplicateGroup(
	ctx: Context,
	request: DeleteDuplicateGroupRequest,
): Promise<DeleteDuplicateGroupResponse> {
	const { container } = ctx;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.DUPLICATE_CONTENT_REPOSITORY,
	);
	logger.info("delete duplicate group", request);

	const { groupId } = request;

	// グループが存在するか確認
	const group = await repository.findById(groupId);
	if (!group) {
		logger.warn(`Duplicate group not found: ${groupId}`);
		throw new Error("Duplicate group not found");
	}

	// グループを削除
	await repository.delete(groupId);

	return { success: true };
}
