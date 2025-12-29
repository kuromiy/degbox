import { isFailure } from "electron-flow/result";
import { type LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import type { AuthorWithVideoCount } from "../../../features/author/author.model.js";
import { AuthorSearchTemplate } from "../../../features/author/ui/templates/author.search.template.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const name = url.searchParams.get("name") ?? undefined;

	const pageStr = url.searchParams.get("page");
	const pageNum = pageStr ? Number(pageStr) : Number.NaN;
	const page = Number.isFinite(pageNum) ? pageNum : 1;

	const sizeStr = url.searchParams.get("size");
	const sizeNum = sizeStr ? Number(sizeStr) : Number.NaN;
	const size = Number.isFinite(sizeNum) ? sizeNum : 20;

	const response = await client.searchAuthor(name, page, size);
	if (isFailure(response)) {
		throw response.value;
	}
	return response.value;
}

export default function AuthorSearchPage() {
	const data = useLoaderData<{
		count: number;
		result: AuthorWithVideoCount[];
		page: number;
		size: number;
	}>();

	return <AuthorSearchTemplate data={data} />;
}
