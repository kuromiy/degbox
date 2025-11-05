import { isFailure } from "electron-flow/result";
import { type LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { VideoSearchTemplate } from "../../../features/video/ui/templates/video.search.template.js";
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
	const data = useLoaderData<{
		count: number;
		result: Video[];
		page: number;
		size: number;
	}>();

	return <VideoSearchTemplate data={data} urlPrefix="/video" />;
}
