import { isFailure } from "electron-flow/result";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
	useLoaderData,
	useNavigate,
} from "react-router-dom";
import type { Illust } from "../../../features/illust/illust.model.js";
import { IllustEditTemplate } from "../../../features/illust/ui/templates/illust.edit.template.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export async function loader({ params }: LoaderFunctionArgs) {
	const { illustId } = params;
	if (!illustId) {
		throw new Error("Illust ID is required");
	}

	const response = await client.detailIllust(illustId);
	if (isFailure(response)) {
		throw response.value;
	}
	return response.value;
}

export async function action({ request, params }: ActionFunctionArgs) {
	const { illustId } = params;
	if (!illustId) {
		throw new Error("Illust ID is required");
	}

	const formData = await request.formData();
	const tags = formData.get("tags")?.toString() ?? "";
	const imageItems = formData.getAll("imageItems").map(String);
	const authorIds = formData.getAll("authorIds").map(String);

	console.log(
		`url: ${request.url}, id: ${illustId}, tags: ${tags}, imageItems: ${imageItems}, authorIds: ${authorIds}`,
	);

	if (imageItems.length === 0) {
		console.log("画像が選択されていません");
		throw new Error("最低1枚の画像が必要です");
	}

	const response = await client.updateIllust(
		illustId,
		tags,
		imageItems,
		authorIds,
	);
	if (isFailure(response)) {
		console.log(`response error: ${response.value.message}`);
		throw new Error(response.value.message);
	}

	// 更新成功後、詳細画面へリダイレクト
	return redirect(`/illust/${illustId}`);
}

export default function IllustEditPage() {
	const illust = useLoaderData<Illust>();
	const navigate = useNavigate();

	const handleCancel = () => {
		navigate(`/illust/${illust.id}`);
	};

	return <IllustEditTemplate illust={illust} onCancel={handleCancel} />;
}
