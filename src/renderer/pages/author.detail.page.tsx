import { isFailure } from "electron-flow/result";
import {
	type LoaderFunctionArgs,
	useLoaderData,
	useNavigate,
} from "react-router-dom";
import { AuthorDetailTemplate } from "../../../features/author/ui/templates/author.detail.template.js";
import type { AuthorDetailResponse } from "../../../src/main/apis/authors/author.detail.api.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { authorId } = params;
	if (!authorId) {
		throw new Error("Author ID is required");
	}

	const url = new URL(request.url);
	const videoPageStr =
		url.searchParams.get("page") ?? url.searchParams.get("videoPage");
	const videoPageNum = videoPageStr ? Number(videoPageStr) : Number.NaN;
	const videoPage = Number.isFinite(videoPageNum) ? videoPageNum : 1;

	const videoSizeStr = url.searchParams.get("videoSize");
	const videoSizeNum = videoSizeStr ? Number(videoSizeStr) : Number.NaN;
	const videoSize = Number.isFinite(videoSizeNum) ? videoSizeNum : 20;

	const response = await client.getAuthorDetail(authorId, videoPage, videoSize);
	if (isFailure(response)) {
		throw response.value;
	}
	return response.value;
}

export default function AuthorDetailPage() {
	const data = useLoaderData<AuthorDetailResponse>();
	const navigate = useNavigate();

	const handleDelete = async () => {
		try {
			const response = await client.deleteAuthor(data.id);
			if (isFailure(response)) {
				throw response.value;
			}
			// 削除成功後、作者検索画面へリダイレクト
			navigate("/author/search");
		} catch (error) {
			console.error("Failed to delete author:", error);
			alert("作者の削除に失敗しました");
		}
	};

	return (
		<AuthorDetailTemplate
			author={{
				id: data.id,
				name: data.name,
				urls: data.urls,
			}}
			videos={data.videos}
			onDelete={handleDelete}
		/>
	);
}
