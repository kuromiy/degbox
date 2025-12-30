import { z } from "zod";
import { zodValidator } from "../../../../features/shared/validation/index.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export const deleteAuthorSchema = z.object({
	id: z.string(),
});
export type DeleteAuthorRequest = z.infer<typeof deleteAuthorSchema>;

export const deleteAuthorValidator = zodValidator(deleteAuthorSchema);

export interface DeleteAuthorResponse {
	success: boolean;
}

export async function deleteAuthor(
	ctx: Context,
	request: DeleteAuthorRequest,
): Promise<DeleteAuthorResponse> {
	const { container } = ctx;
	const [logger, repository] = container.get(
		TOKENS.LOGGER,
		TOKENS.AUTHOR_REPOSITORY,
	);

	logger.info("delete author", request);

	const { id } = request;

	// 作者が存在するか確認
	const author = await repository.get(id);
	if (!author) {
		throw new Error("Author not found");
	}

	// 作者を削除
	const success = await repository.delete(id);

	return {
		success,
	};
}
