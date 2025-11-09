import { PositiveButton } from "../../../shared/ui/components/button.component.js";
import { Input } from "../../../shared/ui/components/input.component.js";
import { Pagination } from "../../../shared/ui/components/pagination.component.js";
import { useNavigation } from "../../../shared/ui/navigation.context.js";
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
		keyword?: string | undefined;
	};
	urlPrefix: string;
}) {
	const { Form } = useNavigation();

	return (
		<main className="container mx-auto pt-10 px-2 flex flex-col justify-center">
			<Form className="mb-8 flex items-center gap-4">
				<Input
					type="text"
					name="keyword"
					placeholder="キーワードを入力..."
					className="flex-1"
				></Input>
				<PositiveButton type="submit">検索</PositiveButton>
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
				baseUrl="/video/search"
				queryParams={{
					...(data.keyword && { keyword: data.keyword }),
					size: data.size,
				}}
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
				baseUrl="/video/search"
				queryParams={{
					...(data.keyword && { keyword: data.keyword }),
					size: data.size,
				}}
			/>
		</main>
	);
}
