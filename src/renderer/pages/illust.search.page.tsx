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

	// 文字列を数値に変換し、デフォルト値と範囲でサニタイズ
	const pageStr = url.searchParams.get("page");
	const pageNum = pageStr ? Number.parseInt(pageStr, 10) : Number.NaN;
	// 無効な値または1未満の場合はデフォルト値1を使用、それ以外は1以上にクランプ
	const page = Number.isFinite(pageNum) && pageNum >= 1 ? pageNum : 1;

	const limitStr = url.searchParams.get("limit");
	const limitNum = limitStr ? Number.parseInt(limitStr, 10) : Number.NaN;
	// 無効な値の場合はデフォルト値20を使用、有効な値は1～100の範囲にクランプ
	const limit = Number.isFinite(limitNum)
		? Math.max(1, Math.min(100, limitNum))
		: 20;

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
