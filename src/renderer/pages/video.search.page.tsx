import { isFailure } from "electron-flow/result";
import { use, useActionState } from "react";
import { Link } from "react-router-dom";
import VideoThumbnail from "../../../features/video/ui/VideoThumbnail.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();
async function fetchVideo(keyword?: string, page?: number, size?: number) {
	const result = await client.searchVideo(keyword, page, size);
	if (isFailure(result)) {
		throw result.value;
	}
	return result.value;
}
const fetchVideoPromise = fetchVideo();

export default function VideoSearchPage() {
	const initData = use(fetchVideoPromise);
	const [state, action, _] = useActionState<
		ReturnType<typeof fetchVideo>,
		FormData
	>(async (_, formData) => {
		const keyword = formData.get("keyword")?.toString();
		const sizeStr = formData.get("size")?.toString();
		const size = sizeStr ? Number.parseInt(sizeStr, 10) : undefined;
		const result = await fetchVideo(keyword, undefined, size);
		return result;
	}, initData);

	return (
		<main className="container mx-auto pt-10 px-2 flex flex-col justify-center">
			<Link to="/register">登録</Link>
			<form action={action} className="mb-8 flex items-center gap-4">
				<input
					type="text"
					name="keyword"
					placeholder="キーワードを入力..."
					className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
				<button
					type="submit"
					className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md hover:shadow-lg"
				>
					検索
				</button>
				<select
					name="size"
					className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
				>
					<option value="10">10件</option>
					<option value="20">20件</option>
					<option value="30">30件</option>
				</select>
			</form>
			<div className="grid grid-cols-3 gap-6">
				{state.result.map((video, index) => {
					return (
						<div key={index.toString()}>
							<VideoThumbnail
								thumbnailPath={video.thumbnailPath}
								previewGifPath={video.previewGifPath}
							/>
						</div>
					);
				})}
			</div>
		</main>
	);
}
