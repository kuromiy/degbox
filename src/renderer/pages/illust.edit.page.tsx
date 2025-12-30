import { isFailure } from "electron-flow/result";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
	useActionData,
	useLoaderData,
	useNavigate,
} from "react-router-dom";
import type { Illust } from "../../../features/illust/illust.model.js";
import { IllustEditTemplate } from "../../../features/illust/ui/templates/illust.edit.template.js";
import { ApiService } from "../autogenerate/register.js";
import {
	type ActionError,
	getErrorMessage,
	isActionError,
	isErrorResponse,
} from "../utils/error.js";

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

	const response = await client.updateIllust(
		illustId,
		tags,
		imageItems,
		authorIds,
	);
	if (isFailure(response)) {
		const error = response.value;
		console.log(`response error: ${getErrorMessage(error)}`);
		if (isErrorResponse(error)) {
			return { error } as ActionError;
		}
		throw new Error(getErrorMessage(error));
	}

	// 更新成功後、詳細画面へリダイレクト
	return redirect(`/illust/${illustId}`);
}

export default function IllustEditPage() {
	const illust = useLoaderData<Illust>();
	const actionData = useActionData<ActionError>();
	const navigate = useNavigate();

	const fieldErrors = isActionError(actionData)
		? actionData.error.type === "valid"
			? actionData.error.messages
			: undefined
		: undefined;

	const generalError =
		isActionError(actionData) && actionData.error.type !== "valid"
			? actionData.error.messages
			: undefined;

	const handleCancel = () => {
		navigate(`/illust/${illust.id}`);
	};

	return (
		<IllustEditTemplate
			illust={illust}
			onCancel={handleCancel}
			fieldErrors={fieldErrors}
			generalError={generalError}
		/>
	);
}
