import { isFailure } from "electron-flow/result";
import { type LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import type { Illust } from "../../../features/illust/illust.model.js";
import { IllustSearchTemplate } from "../../../features/illust/ui/templates/illust.search.template.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const tag = url.searchParams.get("tag") ?? undefined;
	const sortBy = url.searchParams.get("sortBy") ?? undefined;
	const order = url.searchParams.get("order") ?? undefined;

	// 文字列を数値に変換（nullまたは無効な値の場合はundefined）
	const pageStr = url.searchParams.get("page");
	const pageNum = pageStr ? Number(pageStr) : Number.NaN;
	const page = Number.isFinite(pageNum) ? pageNum : undefined;

	const limitStr = url.searchParams.get("limit");
	const limitNum = limitStr ? Number(limitStr) : Number.NaN;
	const limit = Number.isFinite(limitNum) ? limitNum : undefined;

	const response = await client.searchIllust(tag, sortBy, order, page, limit);
	if (isFailure(response)) {
		throw response.value;
	}
	return response.value;
}

export default function IllustSearchPage() {
	const data = useLoaderData<{
		items: Illust[];
		total: number;
		page: number;
		limit: number;
		hasNext: boolean;
		hasPrev: boolean;
		tag?: string;
		sortBy?: string;
		order?: string;
	}>();

	return <IllustSearchTemplate data={data} urlPrefix="/illust" />;
}
