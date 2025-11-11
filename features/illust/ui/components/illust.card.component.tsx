import { useNavigation } from "../../../shared/ui/navigation.context.js";
import type { Illust } from "../../illust.model.js";

interface IllustCardProps {
	illust: Illust;
	to: string;
}

export default function IllustCard({ illust, to }: IllustCardProps) {
	const { Link } = useNavigation();

	// order最小のコンテンツをサムネイルとして表示
	const thumbnail = illust.contents.reduce((min, current) =>
		current.order < min.order ? current : min,
	);

	// 複数画像インジケーター
	const hasMultipleImages = illust.contents.length > 1;
	const remainingCount = illust.contents.length - 1;

	// タグ表示（最大3つ）
	const displayTags = illust.tags.slice(0, 3);
	const hiddenTagsCount = illust.tags.length > 3 ? illust.tags.length - 3 : 0;

	// 作者表示（最大2名）
	const displayAuthors = illust.authors.slice(0, 2);
	const hiddenAuthorsCount =
		illust.authors.length > 2 ? illust.authors.length - 2 : 0;

	return (
		<Link to={to} className="block">
			<div className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-transform duration-200 hover:scale-105 hover:shadow-lg">
				{/* サムネイル */}
				<div className="relative aspect-square w-full overflow-hidden bg-gray-300">
					<img
						src={thumbnail.content.path}
						alt={`イラスト ${illust.id}`}
						className="h-full w-full object-cover"
					/>
					{/* 複数画像インジケーター */}
					{hasMultipleImages && (
						<div className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-1 text-sm text-white">
							📚 +{remainingCount}
						</div>
					)}
				</div>

				{/* カード情報 */}
				<div className="p-3">
					{/* タグ */}
					{displayTags.length > 0 && (
						<div className="mb-2 flex flex-wrap gap-1">
							{displayTags.map((tag) => (
								<span
									key={tag.id}
									className="rounded bg-blue-100 px-2 py-0.5 text-blue-800 text-xs"
								>
									#{tag.name}
								</span>
							))}
							{hiddenTagsCount > 0 && (
								<span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600 text-xs">
									+{hiddenTagsCount}
								</span>
							)}
						</div>
					)}

					{/* 作者 */}
					{displayAuthors.length > 0 && (
						<div className="text-gray-600 text-sm">
							{displayAuthors.map((author, index) => (
								<span key={author.id}>
									{index > 0 && ", "}
									{author.name}
								</span>
							))}
							{hiddenAuthorsCount > 0 && (
								<span className="text-gray-400"> +{hiddenAuthorsCount}</span>
							)}
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}
