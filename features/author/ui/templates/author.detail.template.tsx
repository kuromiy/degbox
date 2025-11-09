import { Pagination } from "../../../shared/ui/components/pagination.component.js";
import { useNavigation } from "../../../shared/ui/navigation.context.js";
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
	onDelete: () => void | Promise<void>;
}

export function AuthorDetailTemplate({
	author,
	videos,
	onDelete,
}: AuthorDetailTemplateProps) {
	const { Link } = useNavigation();

	return (
		<main className="container mx-auto flex flex-col justify-center px-2 pt-10">
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
				<h2 className="mb-4 font-bold text-2xl text-gray-800">
					紐づいた動画一覧
				</h2>

				{videos.count === 0 ? (
					<div className="py-10 text-center text-gray-500">
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

						<div className="my-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
											className="line-clamp-2 font-semibold text-gray-900 text-sm transition-colors duration-200 hover:text-blue-600"
										>
											{video.title}
										</Link>
										<div className="text-gray-600 text-xs">
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
