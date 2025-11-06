import { useNavigation } from "../../../shared/ui/navigation.context.js";
import { Pagination } from "../../../shared/ui/pagination.component.js";
import type { Video } from "../../video.model.js";
import VideoThumbnail from "../components/video.thumbnail.component.js";

export function VideoSearchTemplate({
	data,
	urlPrefix,
}: {
	data: {
		count: number;
		result: Video[];
		page: number;
		size: number;
	};
	urlPrefix: string;
}) {
	const { Link, Form } = useNavigation();

	return (
		<main className="container mx-auto pt-10 px-2 flex flex-col justify-center">
			<Link to="/register">登録</Link>
			<Link to="/author/register">作者登録</Link>
			<Link to="/author/search">作者検索</Link>
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
			<Pagination
				currentPage={data.page}
				totalPages={Math.ceil(data.count / data.size)}
			/>
			<div className="grid grid-cols-3 gap-6">
				{data.result.map((video) => {
					return (
						<div key={video.id}>
							<VideoThumbnail
								thumbnailPath={video.thumbnailPath}
								previewGifPath={video.previewGifPath}
								to={`${urlPrefix}/${video.id}`}
							/>
						</div>
					);
				})}
			</div>
			<Pagination
				currentPage={data.page}
				totalPages={Math.ceil(data.count / data.size)}
			/>
		</main>
	);
}
