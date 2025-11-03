import { isSuccess } from "electron-flow/result";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TagList } from "../../../features/tag/ui/TagList.js";
import { VideoPlayer } from "../../../features/video/ui/VideoPlayer.js";
import type { Video } from "../../../features/video/video.model.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export default function VideoDetailPage() {
	const { videoId } = useParams<{ videoId: string }>();
	const navigate = useNavigate();
	const [video, setVideo] = useState<Video | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!videoId) {
			setError("動画IDが指定されていません");
			setLoading(false);
			return;
		}

		async function fetchVideo() {
			if (!videoId) return;

			try {
				const result = await client.detailVideo(videoId);
				if (isSuccess(result)) {
					setVideo(result.value);
				} else {
					setError("動画の読み込みに失敗しました");
				}
			} catch (err) {
				setError("動画の読み込み中にエラーが発生しました");
				console.error(err);
			} finally {
				setLoading(false);
			}
		}

		fetchVideo();
	}, [videoId]);

	if (loading) {
		return (
			<div className="container mx-auto pt-10 px-2">
				<div className="text-center">読み込み中...</div>
			</div>
		);
	}

	if (error || !video) {
		return (
			<div className="container mx-auto pt-10 px-2">
				<div className="text-center text-red-600">
					{error || "動画が見つかりませんでした"}
				</div>
			</div>
		);
	}

	const firstContent = video.contents[0];
	const videoSrc = firstContent
		? `http://localhost:8080/file/${firstContent.path}/index.m3u8`
		: "";

	return (
		<Suspense fallback={<div>読み込み中...</div>}>
			<main className="container mx-auto pt-10 px-2">
				<div className="mb-6">
					<button
						type="button"
						onClick={() => navigate("/")}
						className="text-blue-500 hover:text-blue-700 transition-colors"
					>
						← 検索に戻る
					</button>
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
							navigate(`/?keyword=${encodeURIComponent(tag.name)}`);
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
		</Suspense>
	);
}
