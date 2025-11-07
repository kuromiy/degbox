import { isFailure } from "electron-flow/result";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
	useLoaderData,
	useNavigate,
} from "react-router-dom";
import { AuthorEditTemplate } from "../../../features/author/ui/templates/author.edit.template.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export async function loader({ params }: LoaderFunctionArgs) {
	const { authorId } = params;
	if (!authorId) {
		throw new Error("Author ID is required");
	}

	const response = await client.getAuthorDetail(authorId, undefined, undefined);
	if (isFailure(response)) {
		throw response.value;
	}
	return {
		id: response.value.id,
		name: response.value.name,
		urls: response.value.urls,
	};
}

export async function action({ request, params }: ActionFunctionArgs) {
	const { authorId } = params;
	if (!authorId) {
		throw new Error("Author ID is required");
	}

	const formData = await request.formData();
	const name = formData.get("name")?.toString();
	const urls = formData.get("urls")?.toString() || "{}";

	console.log(`id: ${authorId}, name: ${name}, urls: ${urls}`);
	if (!name) {
		console.log("必須項目が入力されていません");
		throw new Error("必須項目が入力されていません");
	}

	const response = await client.updateAuthor(authorId, name, urls);
	if (isFailure(response)) {
		console.log(`response error: ${response.value.message}`);
		throw new Error(response.value.message);
	}

	// 更新成功後、作者詳細画面へリダイレクト
	return redirect(`/author/${authorId}`);
}

export default function AuthorEditPage() {
	const author = useLoaderData<{
		id: string;
		name: string;
		urls: Record<string, string>;
	}>();
	const navigate = useNavigate();

	const handleCancel = () => {
		navigate(`/author/${author.id}`);
	};

	return <AuthorEditTemplate author={author} onCancel={handleCancel} />;
}
