import type { DuplicateGroup } from "../../duplicate.content.model.js";

interface DuplicateGroupCardProps {
	group: DuplicateGroup;
	thumbnailUrl: string | undefined;
	onClick: () => void;
}

export function DuplicateGroupCard({
	group,
	thumbnailUrl,
	onClick,
}: DuplicateGroupCardProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-left transition-transform duration-200 hover:scale-105 hover:shadow-lg"
		>
			{/* サムネイル */}
			<div className="relative aspect-square w-full overflow-hidden bg-gray-300">
				{thumbnailUrl ? (
					<img
						src={thumbnailUrl}
						alt="重複グループサムネイル"
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-gray-400">
						No Image
					</div>
				)}
				{/* アイテム数インジケーター */}
				<div className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-1 text-sm text-white">
					{group.items.length}件
				</div>
			</div>

			{/* カード情報 */}
			<div className="p-3">
				<div className="mb-1 text-gray-600 text-sm">
					ハッシュタイプ: {group.hashType}
				</div>
				<div className="truncate text-gray-500 text-xs">ID: {group.id}</div>
			</div>
		</button>
	);
}
