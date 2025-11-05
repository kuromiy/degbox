import { useNavigation } from "../../shared/ui/navigation.context.js";
import type { Tag } from "../tag.model.js";

export function TagList({
	tags,
	urlPrefix,
}: {
	tags: Tag[];
	urlPrefix: string;
}) {
	const { Link } = useNavigation();

	return (
		<div className="flex flex-wrap gap-2">
			{tags.map((tag) => (
				<Link
					key={tag.id}
					to={`${urlPrefix}?keyword=${encodeURIComponent(tag.name)}`}
				>
					{tag.name}
				</Link>
			))}
			{tags.length === 0 && (
				<span className="text-gray-500 text-sm">タグがありません</span>
			)}
		</div>
	);
}
