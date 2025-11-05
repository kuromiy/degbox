import { useNavigation } from "../../../shared/ui/navigation.context.js";
import type { AuthorWithVideoCount } from "../../author.model.js";

export default function AuthorCard({
	author,
}: {
	author: AuthorWithVideoCount;
}) {
	const { Link } = useNavigation();

	return (
		<div className="p-6 bg-white border border-gray-200 rounded-lg shadow">
			<div className="flex flex-col gap-3">
				<Link
					to={`/author/${author.id}`}
					className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200"
				>
					{author.name}
				</Link>

				<div className="text-sm text-gray-600">動画数: {author.videoCount}</div>

				{Object.keys(author.urls).length > 0 && (
					<div className="flex flex-wrap gap-2">
						{Object.entries(author.urls).map(([platform, url]) => (
							<a
								key={platform}
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
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
