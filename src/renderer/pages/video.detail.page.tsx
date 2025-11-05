import { isFailure } from "electron-flow/result";
import { Suspense } from "react";
import { type LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { useNavigation } from "../../../features/shared/ui/navigation.context.js";
import { TagList } from "../../../features/tag/ui/tag.list.component.js";
import { VideoPlayer } from "../../../features/video/ui/VideoPlayer.js";
import type { Video } from "../../../features/video/video.model.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export async function loader({ params }: LoaderFunctionArgs) {
	const videoId = params.videoId;
	if (!videoId) {
		throw new Error("not found videoId");
	}
	const response = await client.detailVideo(videoId);
	if (isFailure(response)) {
		throw response.value;
	}
	return response.value;
}

export default function VideoDetailPage() {
	const { Link } = useNavigation();
	const video = useLoaderData<Video>();
	const firstContent = video.contents[0];
	const videoSrc = firstContent
		? `http://192.168.3.33:8080/file/${firstContent.path}/index.m3u8`
		: "";

	return (
		<Suspense fallback={<div>読み込み中...</div>}>
			<main className="container mx-auto pt-10 px-2">
				<div className="mb-6">
					<Link
						to="/"
						className="text-blue-500 hover:text-blue-700 transition-colors"
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
					<h2 className="text-xl font-bold mb-4">タグ</h2>
					<TagList tags={video.tags} urlPrefix="/" />
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
		</Suspense>
	);
}
