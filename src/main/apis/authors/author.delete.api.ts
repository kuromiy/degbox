import { z } from "zod";
import type { Context } from "../../context.js";
import { TOKENS } from "../../depend.injection.js";

export const deleteAuthorSchema = z.object({
	id: z.string(),
});
export type DeleteAuthorRequest = z.infer<typeof deleteAuthorSchema>;

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
	const valid = deleteAuthorSchema.safeParse(request);
	if (!valid.success) {
		logger.warn("Invalid request", valid.error);
		throw new Error("Invalid request");
	}

	const { id } = valid.data;

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
