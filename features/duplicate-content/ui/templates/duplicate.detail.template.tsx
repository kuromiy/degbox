import { useState } from "react";
import type { Content } from "../../../content/content.model.js";
import {
	NegativeButton,
	NeutralButton,
} from "../../../shared/ui/components/button.component.js";
import { useToast } from "../../../shared/ui/toast.context.js";
import type {
	DuplicateGroup,
	DuplicateGroupItem,
} from "../../duplicate.content.model.js";
import { DuplicateContentCard } from "../components/duplicate.content.card.component.js";

interface ContentWithItem extends DuplicateGroupItem {
	content: Content | null;
}

interface DuplicateDetailTemplateProps {
	group: DuplicateGroup;
	contents: ContentWithItem[];
	getContentUrl: (content: Content | null) => string | undefined;
	onRemoveItem: (contentId: string) => Promise<void>;
	onDeleteContent: (contentId: string) => Promise<void>;
	onDeleteGroup: () => Promise<void>;
	onBack: () => void;
}

export function DuplicateDetailTemplate({
	group,
	contents,
	getContentUrl,
	onRemoveItem,
	onDeleteContent,
	onDeleteGroup,
	onBack,
}: DuplicateDetailTemplateProps) {
	const { addToast } = useToast();
	const [selectedContentId, setSelectedContentId] = useState<string | null>(
		null,
	);
	const [isDeleting, setIsDeleting] = useState(false);
	const [processingContentId, setProcessingContentId] = useState<string | null>(
		null,
	);

	const handleRemoveItem = async (contentId: string) => {
		if (!confirm("このコンテンツをグループから除外しますか？")) return;
		if (processingContentId) return; // 重複送信防止

		setProcessingContentId(contentId);
		try {
			await onRemoveItem(contentId);
		} catch (error) {
			console.error("Failed to remove item:", error);
			addToast("error", "アイテムの除外に失敗しました");
		} finally {
			setProcessingContentId(null);
		}
	};

	const handleDeleteContent = async (contentId: string) => {
		if (
			!confirm("このコンテンツを完全に削除しますか？この操作は取り消せません。")
		)
			return;
		if (processingContentId) return; // 重複送信防止

		setProcessingContentId(contentId);
		try {
			await onDeleteContent(contentId);
		} catch (error) {
			console.error("Failed to delete content:", error);
			addToast("error", "コンテンツの削除に失敗しました");
		} finally {
			setProcessingContentId(null);
		}
	};

	const handleDeleteGroup = async () => {
		if (!confirm("このグループを削除しますか？この操作は取り消せません。"))
			return;
		if (isDeleting) return; // 重複送信防止

		setIsDeleting(true);
		try {
			await onDeleteGroup();
		} catch (error) {
			console.error("Failed to delete group:", error);
			addToast("error", "グループの削除に失敗しました");
			setIsDeleting(false);
		}
	};

	// 選択中のコンテンツ
	const selectedContent = contents.find(
		(c) => c.contentId === selectedContentId,
	);

	return (
		<main className="container mx-auto flex flex-col px-2 pt-10">
			{/* ヘッダー */}
			<div className="mb-8">
				<button
					type="button"
					onClick={onBack}
					className="mb-4 text-blue-600 hover:underline"
				>
					← 一覧に戻る
				</button>
				<h1 className="mb-2 font-bold text-2xl text-gray-800">
					重複グループ詳細
				</h1>
				<div className="text-gray-600">
					<span className="mr-4">ハッシュタイプ: {group.hashType}</span>
					<span>{contents.length}件のコンテンツ</span>
				</div>
			</div>

			<div className="flex gap-8">
				{/* 左側: コンテンツグリッド */}
				<div className="flex-1">
					<h2 className="mb-4 font-semibold text-gray-700 text-lg">
						重複コンテンツ一覧
					</h2>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
						{contents.map((item) => (
							<DuplicateContentCard
								key={item.contentId}
								item={item}
								content={item.content}
								contentUrl={getContentUrl(item.content)}
								isSelected={selectedContentId === item.contentId}
								isProcessing={processingContentId === item.contentId}
								onSelect={() => setSelectedContentId(item.contentId)}
								onRemove={() => handleRemoveItem(item.contentId)}
								onDeleteContent={() => handleDeleteContent(item.contentId)}
							/>
						))}
					</div>
				</div>

				{/* 右側: 選択コンテンツプレビュー */}
				<div className="w-96">
					<h2 className="mb-4 font-semibold text-gray-700 text-lg">
						プレビュー
					</h2>
					{selectedContent ? (
						<div className="rounded-lg border border-gray-200 bg-white p-4">
							<div className="mb-4 aspect-square overflow-hidden rounded bg-gray-100">
								{getContentUrl(selectedContent.content) ? (
									<img
										src={getContentUrl(selectedContent.content)}
										alt={selectedContent.content?.name ?? "コンテンツ"}
										className="h-full w-full object-contain"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center text-gray-400">
										No Image
									</div>
								)}
							</div>
							<div className="space-y-2 text-sm">
								<div>
									<span className="font-medium text-gray-600">名前:</span>
									<span className="ml-2 text-gray-800">
										{selectedContent.content?.name ?? "不明"}
									</span>
								</div>
								<div>
									<span className="font-medium text-gray-600">パス:</span>
									<span className="ml-2 break-all text-gray-800">
										{selectedContent.content?.path ?? "不明"}
									</span>
								</div>
								<div>
									<span className="font-medium text-gray-600">類似度:</span>
									<span className="ml-2 text-gray-800">
										{selectedContent.similarity}%
									</span>
								</div>
								<div>
									<span className="font-medium text-gray-600">タイプ:</span>
									<span className="ml-2 text-gray-800">
										{selectedContent.content?.type ?? "不明"}
									</span>
								</div>
							</div>
						</div>
					) : (
						<div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
							コンテンツを選択してプレビュー
						</div>
					)}
				</div>
			</div>

			{/* アクションボタン */}
			<div className="mt-8 flex justify-end gap-4 border-t pt-6">
				<NeutralButton onClick={onBack}>戻る</NeutralButton>
				<NegativeButton onClick={handleDeleteGroup} disabled={isDeleting}>
					{isDeleting ? "削除中..." : "グループを削除"}
				</NegativeButton>
			</div>
		</main>
	);
}
