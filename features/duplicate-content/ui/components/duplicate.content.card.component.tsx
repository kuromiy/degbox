import type { Content } from "../../../content/content.model.js";
import type { DuplicateGroupItem } from "../../duplicate.content.model.js";

interface DuplicateContentCardProps {
	item: DuplicateGroupItem;
	content: Content | null;
	contentUrl: string | undefined;
	isSelected: boolean;
	onSelect: () => void;
	onRemove: () => void;
}

export function DuplicateContentCard({
	item,
	content,
	contentUrl,
	isSelected,
	onSelect,
	onRemove,
}: DuplicateContentCardProps) {
	return (
		<div
			className={`overflow-hidden rounded-lg border-2 bg-white ${
				isSelected ? "border-blue-500" : "border-gray-200"
			}`}
		>
			{/* サムネイル */}
			<button
				type="button"
				onClick={onSelect}
				className="relative aspect-square w-full overflow-hidden bg-gray-300"
			>
				{contentUrl ? (
					<img
						src={contentUrl}
						alt={content?.name ?? "コンテンツ"}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-gray-400">
						No Image
					</div>
				)}
				{/* 類似度バッジ */}
				<div className="absolute top-2 left-2 rounded bg-blue-500/80 px-2 py-1 text-sm text-white">
					{item.similarity}%
				</div>
				{/* 選択インジケーター */}
				{isSelected && (
					<div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
						<div className="rounded-full bg-blue-500 p-2 text-white">
							<svg
								className="h-6 w-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								role="img"
								aria-label="選択済み"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
					</div>
				)}
			</button>

			{/* カード情報 */}
			<div className="p-3">
				<div className="mb-2 truncate text-gray-800 text-sm">
					{content?.name ?? "不明"}
				</div>
				<div className="mb-2 truncate text-gray-500 text-xs">
					{content?.path ?? "パス不明"}
				</div>
				<button
					type="button"
					onClick={onRemove}
					className="w-full rounded bg-red-100 px-3 py-1 text-red-700 text-sm hover:bg-red-200"
				>
					グループから除外
				</button>
			</div>
		</div>
	);
}
