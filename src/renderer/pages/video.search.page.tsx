import { isFailure } from "electron-flow/result";
import {
	type LoaderFunctionArgs,
	useLoaderData,
	useNavigate,
} from "react-router-dom";
import { useNavigation } from "../../../features/shared/ui/navigation.context.js";
import VideoThumbnail from "../../../features/video/ui/components/video.thumbnail.component.js";
import type { Video } from "../../../features/video/video.model.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	console.log(url);
	const keyword = url.searchParams.get("keyword") ?? undefined;

	// 文字列を数値に変換（nullの場合はundefined）
	const pageStr = url.searchParams.get("page");
	const page = pageStr ? Number(pageStr) : undefined;

	const sizeStr = url.searchParams.get("size");
	const size = sizeStr ? Number(sizeStr) : undefined;

	const response = await client.searchVideo(keyword, page, size);
	if (isFailure(response)) {
		throw response.value;
	}
	return response.value;
}

export default function VideoSearchPage() {
	const { Link, Form } = useNavigation();
	const data = useLoaderData<{
		count: number;
		result: Video[];
		page: number;
		size: number;
	}>();
	const navigate = useNavigate();

	return (
		<main className="container mx-auto pt-10 px-2 flex flex-col justify-center">
			<Link to="/register">登録</Link>
			<Form className="mb-8 flex items-center gap-4">
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
			</Form>
			<div className="grid grid-cols-3 gap-6">
				{data.result.map((video) => {
					return (
						<div key={video.id}>
							<VideoThumbnail
								thumbnailPath={video.thumbnailPath}
								previewGifPath={video.previewGifPath}
								onClick={() => navigate(`/video/${video.id}`)}
							/>
						</div>
					);
				})}
			</div>
		</main>
	);
}
