import { isFailure } from "electron-flow/result";
import { Suspense } from "react";
import {
	type LoaderFunctionArgs,
	useLoaderData,
	useNavigate,
} from "react-router-dom";
import type { Illust } from "../../../../features/illust/illust.model.js";
import { IllustDetailTemplate } from "../../../../features/illust/ui/templates/illust.detail.template.js";
import { ApiService } from "../../autogenerate/register.js";

const client = new ApiService();

export async function loader({ params }: LoaderFunctionArgs) {
	const illustId = params.illustId;
	if (!illustId) {
		throw new Error("not found illustId");
	}
	const response = await client.detailIllust(illustId);
	if (isFailure(response)) {
		throw response.value;
	}
	return response.value;
}

export default function IllustDetailPage() {
	const illust = useLoaderData<Illust>();
	const navigate = useNavigate();

	const handleDelete = async () => {
		const result = await client.deleteIllust(illust.id);

		if (isFailure(result)) {
			throw new Error("削除に失敗しました");
		}

		// 検索画面へ遷移
		navigate("/illust/search");
	};

	return (
		<Suspense fallback={<div>読み込み中...</div>}>
			<IllustDetailTemplate
				illust={illust}
				backUrl="/illust/search"
				tagUrlPrefix="/illust/search"
				onDelete={handleDelete}
			/>
		</Suspense>
	);
}
