import { useNavigation } from "../../../shared/ui/navigation.context.js";
import { TagList } from "../../../tag/ui/tag.list.component.js";
import type { Video } from "../../video.model.js";
import { VideoPlayer } from "../components/video.player.component.js";

export function VideoDetailTemplate({
	video,
	backUrl,
	videoSrc,
	tagUrlPrefix = "/",
}: {
	video: Video;
	backUrl: string;
	videoSrc: string;
	tagUrlPrefix?: string;
}) {
	const { Link } = useNavigation();

	return (
		<main className="container mx-auto px-2 pt-10">
			<div className="mb-6">
				<Link
					to={backUrl}
					className="text-blue-500 transition-colors hover:text-blue-700"
				>
					← 検索に戻る
				</Link>
			</div>

			{/* 動画プレーヤー */}
			<div className="mb-8">
				<VideoPlayer src={videoSrc} />
			</div>

			{/* タグ一覧 */}
			<div className="mb-8">
				<h2 className="mb-4 font-bold text-xl">タグ</h2>
				<TagList tags={video.tags} urlPrefix={tagUrlPrefix} />
			</div>

			{/* 動画情報 */}
			<div className="rounded-lg bg-gray-50 p-6">
				<h2 className="mb-4 font-bold text-xl">動画情報</h2>

				<div className="mb-4">
					<h3 className="mb-2 font-semibold text-gray-600 text-sm">動画ID</h3>
					<p className="text-gray-800">{video.id}</p>
				</div>

				{video.authors.length > 0 && (
					<div className="mb-4">
						<h3 className="mb-2 font-semibold text-gray-600 text-sm">作者</h3>
						<div className="flex flex-wrap gap-2">
							{video.authors.map((author) => (
								<span
									key={author.id}
									className="rounded-full bg-gray-200 px-3 py-1 text-sm"
								>
									{author.name}
								</span>
							))}
						</div>
					</div>
				)}

				{video.contents.length > 0 && (
					<div>
						<h3 className="mb-2 font-semibold text-gray-600 text-sm">
							コンテンツファイル
						</h3>
						<div className="space-y-1">
							{video.contents.map((content) => (
								<div key={content.id} className="text-gray-600 text-sm">
									{content.path}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
