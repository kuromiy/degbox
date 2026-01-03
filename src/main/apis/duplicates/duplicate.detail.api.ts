import { posix } from "node:path";
import { z } from "zod";
import { zodValidator } from "../../../../features/shared/validation/index.js";
import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

const FILE_SERVER_URL = process.env.FILE_SERVER_URL || "http://localhost:8080";

function buildFileUrl(path: string): string {
	const baseUrl = FILE_SERVER_URL.replace(/\/$/, "");
	const normalizedPath = path.replace(/^\//, "");
	return `${baseUrl}/file/${normalizedPath}`;
}

export const getDuplicateGroupSchema = z.object({
	groupId: z.string(),
});
export type GetDuplicateGroupRequest = z.infer<typeof getDuplicateGroupSchema>;

export const getDuplicateGroupValidator = zodValidator(getDuplicateGroupSchema);

export async function getDuplicateGroup(
	ctx: Context,
	request: GetDuplicateGroupRequest,
) {
	const { container } = ctx;
	const [logger, duplicateRepository, contentRepository] = container.get(
		TOKENS.LOGGER,
		TOKENS.DUPLICATE_CONTENT_REPOSITORY,
		TOKENS.CONTENT_REPOSITORY,
	);
	logger.info("get duplicate group", request);

	const group = await duplicateRepository.findById(request.groupId);
	if (!group) {
		return { group: null, contents: [] };
	}

	// 各コンテンツの詳細情報を取得し、pathをURLに変換
	const contents = await Promise.all(
		group.items.map(async (item) => {
			const content = await contentRepository.findById(item.contentId);
			if (!content) {
				return {
					...item,
					content: null,
				};
			}
			return {
				...item,
				content: {
					...content,
					path: buildFileUrl(posix.join(content.path, content.name)),
				},
			};
		}),
	);

	return { group, contents };
}
