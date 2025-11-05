import type { Tag } from "../tag.model.js";

interface TagListProps {
	tags: Tag[];
	onTagClick?: (tag: Tag) => void;
	className?: string;
}

/**
 * タグ一覧表示コンポーネント
 *
 * タグをクリック可能なバッジとして表示する。
 * onTagClickが指定されている場合、タグクリック時にコールバックを実行。
 */
export function TagList({ tags, onTagClick, className = "" }: TagListProps) {
	return (
		<div className={`flex flex-wrap gap-2 ${className}`}>
			{tags.map((tag) => (
				<button
					type="button"
					key={tag.id}
					onClick={() => onTagClick?.(tag)}
					className={`px-3 py-1 rounded-full text-sm ${
						onTagClick
							? "bg-blue-100 hover:bg-blue-200 text-blue-800 cursor-pointer transition-colors"
							: "bg-gray-100 text-gray-800"
					}`}
					disabled={!onTagClick}
				>
					{tag.name}
				</button>
			))}
			{tags.length === 0 && (
				<span className="text-gray-500 text-sm">タグがありません</span>
			)}
		</div>
	);
}
