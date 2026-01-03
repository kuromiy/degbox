import { isFailure } from "electron-flow/result";
import { useCallback } from "react";
import {
	type LoaderFunctionArgs,
	useLoaderData,
	useNavigate,
	useRevalidator,
} from "react-router-dom";
import type { Content } from "../../../features/content/content.model.js";
import type {
	DuplicateGroup,
	DuplicateGroupItem,
} from "../../../features/duplicate-content/duplicate.content.model.js";
import { DuplicateDetailTemplate } from "../../../features/duplicate-content/ui/templates/duplicate.detail.template.js";
import { useToast } from "../../../features/shared/ui/toast.context.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

interface ContentWithItem extends DuplicateGroupItem {
	content: Content | null;
}

export async function loader({ params }: LoaderFunctionArgs) {
	const groupId = params.groupId;
	if (!groupId) {
		throw new Error("グループIDが指定されていません");
	}

	const response = await client.getDuplicateGroup(groupId);
	if (isFailure(response)) {
		throw new Error(
			typeof response.value === "string"
				? response.value
				: JSON.stringify(response.value),
		);
	}
	return response.value;
}

export default function DuplicateDetailPage() {
	const data = useLoaderData<{
		group: DuplicateGroup | null;
		contents: ContentWithItem[];
	}>();
	const revalidator = useRevalidator();
	const navigate = useNavigate();
	const { addToast } = useToast();

	// コンテンツURL取得（ファイルパスを直接使用）
	const getContentUrl = (content: Content | null): string | undefined => {
		if (!content) return undefined;
		return content.path;
	};

	const handleRemoveItem = useCallback(
		async (contentId: string) => {
			if (!data.group) return;
			const response = await client.removeItemFromGroup(
				data.group.id,
				contentId,
			);
			if (isFailure(response)) {
				console.error("Failed to remove item:", response.value);
				addToast("error", "アイテムの除外に失敗しました");
				return;
			}
			// データを再取得
			revalidator.revalidate();
		},
		[data.group, revalidator, addToast],
	);

	const handleDeleteContent = useCallback(
		async (contentId: string) => {
			if (!data.group) return;
			const response = await client.deleteContent(data.group.id, contentId);
			if (isFailure(response)) {
				console.error("Failed to delete content:", response.value);
				addToast("error", "コンテンツの削除に失敗しました");
				return;
			}
			// データを再取得
			revalidator.revalidate();
		},
		[data.group, revalidator, addToast],
	);

	const handleDeleteGroup = useCallback(async () => {
		if (!data.group) return;
		const response = await client.deleteDuplicateGroup(data.group.id);
		if (isFailure(response)) {
			console.error("Failed to delete group:", response.value);
			throw response.value;
		}
		navigate("/duplicate");
	}, [data.group, navigate]);

	const handleBack = useCallback(() => {
		navigate("/duplicate");
	}, [navigate]);

	if (!data.group) {
		return (
			<main className="container mx-auto px-2 pt-10">
				<div className="text-center text-gray-500">
					グループが見つかりませんでした
				</div>
			</main>
		);
	}

	return (
		<DuplicateDetailTemplate
			group={data.group}
			contents={data.contents}
			getContentUrl={getContentUrl}
			onRemoveItem={handleRemoveItem}
			onDeleteContent={handleDeleteContent}
			onDeleteGroup={handleDeleteGroup}
			onBack={handleBack}
		/>
	);
}
