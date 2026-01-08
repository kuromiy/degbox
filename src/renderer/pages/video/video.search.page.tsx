import { isFailure } from "electron-flow/result";
import { type LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { VideoSearchTemplate } from "../../../../features/video/ui/templates/video.search.template.js";
import type { Video } from "../../../../features/video/video.model.js";
import { ApiService } from "../../autogenerate/register.js";

const client = new ApiService();

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const keyword = url.searchParams.get("keyword") ?? "";
	const sortBy = url.searchParams.get("sortBy") ?? "createdAt";
	const order = url.searchParams.get("order") ?? "desc";

	// 文字列を数値に変換（nullまたは無効な値の場合はデフォルト値）
	const pageStr = url.searchParams.get("page");
	const pageNum = pageStr ? Number(pageStr) : Number.NaN;
	const page = Number.isFinite(pageNum) ? pageNum : 1;

	const sizeStr = url.searchParams.get("size");
	const sizeNum = sizeStr ? Number(sizeStr) : Number.NaN;
	const size = Number.isFinite(sizeNum) ? sizeNum : 20;

	const response = await client.searchVideo(keyword, sortBy, order, page, size);
	if (isFailure(response)) {
		throw response.value;
	}
	return response.value;
}

export default function VideoSearchPage() {
	const data = useLoaderData<{
		count: number;
		result: Video[];
		page: number;
		size: number;
	}>();

	return <VideoSearchTemplate data={data} urlPrefix="/video" />;
}
