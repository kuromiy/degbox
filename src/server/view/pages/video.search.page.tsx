import VideoThumbnail from "../../../../features/video/ui/VideoThumbnail.js";
import type { Video } from "../../../../features/video/video.model.js";

type SearchResult = {
	count: number;
	result: Video[];
	page: number;
	size: number;
	keyword?: string;
};

type VideoSearchPageProps = {
	searchResult?: SearchResult;
	errors?: Record<string, string[]>;
};

export default function VideoSearchPage({
	searchResult,
	errors,
}: VideoSearchPageProps) {
	const queryErrors = errors?.query;
	const hasQueryError = !!(queryErrors && queryErrors.length > 0);

	return (
		<main className="container mx-auto pt-10 px-2 flex flex-col justify-center">
			<h1 className="text-3xl font-bold mb-6">動画検索</h1>

			<form method="GET" className="mb-8 flex items-center gap-4">
				<input
					type="text"
					name="keyword"
					placeholder="キーワードを入力..."
					className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
						hasQueryError ? "border-red-500" : "border-gray-300"
					}`}
				/>
				<select
					name="size"
					className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
				>
					<option value="10">10件</option>
					<option value="20">20件</option>
					<option value="30">30件</option>
				</select>
				<button
					type="submit"
					className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md hover:shadow-lg"
				>
					検索
				</button>
			</form>

			{hasQueryError && (
				<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
					<div className="text-red-600">
						{queryErrors.map((error) => (
							<div key={error}>{error}</div>
						))}
					</div>
				</div>
			)}

			<div className="grid grid-cols-3 gap-6">
				{searchResult?.result.map((video) => {
					return (
						<a
							key={video.id}
							href={`/video/detail/${video.id}`}
							className="block"
						>
							<VideoThumbnail
								thumbnailPath={video.thumbnailPath}
								previewGifPath={video.previewGifPath}
							/>
						</a>
					);
				})}
			</div>
		</main>
	);
}
