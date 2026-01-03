import { isFailure } from "electron-flow/result";
import { useCallback } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import type { DuplicateGroup } from "../../../features/duplicate-content/duplicate.content.model.js";
import { DuplicateListTemplate } from "../../../features/duplicate-content/ui/templates/duplicate.list.template.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

// APIレスポンスの型（thumbnailPath付き）
type DuplicateGroupWithThumbnail = DuplicateGroup & {
	thumbnailPath?: string;
};

export async function loader() {
	const response = await client.listDuplicateGroups();
	if (isFailure(response)) {
		throw new Error(
			typeof response.value === "string"
				? response.value
				: JSON.stringify(response.value),
		);
	}
	return response.value;
}

export default function DuplicateListPage() {
	const data = useLoaderData<{ groups: DuplicateGroupWithThumbnail[] }>();
	const navigate = useNavigate();

	// サムネイルURL取得（APIから取得したthumbnailPathを使用）
	const getThumbnailUrl = (
		group: DuplicateGroupWithThumbnail,
	): string | undefined => {
		return group.thumbnailPath;
	};

	const handleGroupClick = useCallback(
		(groupId: string) => {
			navigate(`/duplicate/${groupId}`);
		},
		[navigate],
	);

	return (
		<DuplicateListTemplate
			groups={data.groups}
			getThumbnailUrl={getThumbnailUrl}
			onGroupClick={handleGroupClick}
		/>
	);
}
