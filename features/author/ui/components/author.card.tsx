import { useNavigation } from "../../../shared/ui/navigation.context.js";
import type { AuthorWithVideoCount } from "../../author.model.js";

export default function AuthorCard({
	author,
}: {
	author: AuthorWithVideoCount;
}) {
	const { Link } = useNavigation();

	return (
		<div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
			<div className="flex flex-col gap-3">
				<Link
					to={`/author/${author.id}`}
					className="font-semibold text-gray-900 text-xl transition-colors duration-200 hover:text-blue-600"
				>
					{author.name}
				</Link>

				<div className="text-gray-600 text-sm">動画数: {author.videoCount}</div>

				{Object.keys(author.urls).length > 0 && (
					<div className="flex flex-wrap gap-2">
						{Object.entries(author.urls).map(([platform, url]) => (
							<a
								key={platform}
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 text-sm hover:text-blue-800 hover:underline"
							>
								{platform}
							</a>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
