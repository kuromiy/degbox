import { useNavigation } from "../../../shared/ui/navigation.context.js";
import { Pagination } from "../../../shared/ui/pagination.component.js";
import VideoThumbnail from "../../../video/ui/components/video.thumbnail.component.js";
import type { Author } from "../../author.model.js";
import AuthorInfo from "../components/author.info.js";

interface AuthorDetailTemplateProps {
	author: Author;
	videos: {
		count: number;
		result: Array<{
			id: string;
			title: string;
			thumbnailPath?: string;
			previewGifPath?: string;
			createdAt: string;
		}>;
		page: number;
		size: number;
	};
	onDelete: () => void;
}

export function AuthorDetailTemplate({
	author,
	videos,
	onDelete,
}: AuthorDetailTemplateProps) {
	const { Link } = useNavigation();

	return (
		<main className="container mx-auto pt-10 px-2 flex flex-col justify-center">
			<div className="mb-6">
				<Link
					to="/author/search"
					className="text-blue-600 hover:text-blue-800 hover:underline"
				>
					← 作者検索に戻る
				</Link>
			</div>

			<AuthorInfo author={author} onDelete={onDelete} />

			<div className="mt-8">
				<h2 className="text-2xl font-bold text-gray-800 mb-4">
					紐づいた動画一覧
				</h2>

				{videos.count === 0 ? (
					<div className="text-center text-gray-500 py-10">
						この作者に紐づいた動画がありません
					</div>
				) : (
					<>
						<div className="mb-4 text-gray-600">
							{videos.count}件の動画が見つかりました
						</div>

						<Pagination
							currentPage={videos.page}
							totalPages={Math.ceil(videos.count / videos.size)}
							baseUrl={`/author/${author.id}`}
							queryParams={{
								videoSize: videos.size,
							}}
						/>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
							{videos.result.map((video) => (
								<div key={video.id} className="flex flex-col gap-2">
									<VideoThumbnail
										thumbnailPath={video.thumbnailPath || ""}
										previewGifPath={video.previewGifPath || ""}
										to={`/video/${video.id}`}
										alt={video.title}
									/>
									<div className="flex flex-col gap-1">
										<Link
											to={`/video/${video.id}`}
											className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2"
										>
											{video.title}
										</Link>
										<div className="text-xs text-gray-600">
											{new Date(video.createdAt).toLocaleDateString("ja-JP")}
										</div>
									</div>
								</div>
							))}
						</div>

						<Pagination
							currentPage={videos.page}
							totalPages={Math.ceil(videos.count / videos.size)}
							baseUrl={`/author/${author.id}`}
							queryParams={{
								videoSize: videos.size,
							}}
						/>
					</>
				)}
			</div>
		</main>
	);
}
