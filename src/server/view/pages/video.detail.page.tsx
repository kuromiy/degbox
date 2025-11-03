import { TagList } from "../../../../features/tag/ui/TagList.js";
import { VideoPlayer } from "../../../../features/video/ui/VideoPlayer.js";
import type { Video } from "../../../../features/video/video.model.js";

type VideoDetailPageProps = {
	video: Video;
};

export default function VideoDetailPage({ video }: VideoDetailPageProps) {
	// 最初のコンテンツファイルを動画ソースとして使用
	const firstContent = video.contents[0];
	const videoSrc = firstContent
		? `http://localhost:8080/file/${firstContent.path}/index.m3u8`
		: "";

	return (
		<main className="container mx-auto pt-10 px-2">
			<div className="mb-6">
				<a
					href="/video/search"
					className="text-blue-500 hover:text-blue-700 transition-colors"
				>
					← 検索に戻る
				</a>
			</div>

			{/* 動画プレーヤー */}
			<div className="mb-8">
				<VideoPlayer src={videoSrc} />
			</div>

			{/* タグ一覧 */}
			<div className="mb-8">
				<h2 className="text-xl font-bold mb-4">タグ</h2>
				<TagList
					tags={video.tags}
					onTagClick={(tag) => {
						// SSRなのでクリックイベントは機能しないが、
						// クライアント側でハイドレーション後に動作する
						window.location.href = `/video/search?keyword=${encodeURIComponent(tag.name)}`;
					}}
				/>
			</div>

			{/* 動画情報 */}
			<div className="bg-gray-50 rounded-lg p-6">
				<h2 className="text-xl font-bold mb-4">動画情報</h2>

				<div className="mb-4">
					<h3 className="text-sm font-semibold text-gray-600 mb-2">動画ID</h3>
					<p className="text-gray-800">{video.id}</p>
				</div>

				{video.authors.length > 0 && (
					<div className="mb-4">
						<h3 className="text-sm font-semibold text-gray-600 mb-2">作者</h3>
						<div className="flex flex-wrap gap-2">
							{video.authors.map((author) => (
								<span
									key={author.id}
									className="px-3 py-1 bg-gray-200 rounded-full text-sm"
								>
									{author.name}
								</span>
							))}
						</div>
					</div>
				)}

				{video.contents.length > 0 && (
					<div>
						<h3 className="text-sm font-semibold text-gray-600 mb-2">
							コンテンツファイル
						</h3>
						<div className="space-y-1">
							{video.contents.map((content) => (
								<div key={content.id} className="text-sm text-gray-600">
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
