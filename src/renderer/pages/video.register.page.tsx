import { isFailure } from "electron-flow/result";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
	useActionData,
	useLoaderData,
} from "react-router-dom";
import { VideoRegisterTemplate } from "../../../features/video/ui/templates/video.register.template.js";
import { ApiService } from "../autogenerate/register.js";
import {
	type ActionError,
	getErrorMessage,
	isActionError,
	isErrorResponse,
} from "../utils/error.js";

const client = new ApiService();

export function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const timestamp = url.searchParams.get("timestamp") ?? Date.now().toString();
	return timestamp;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const tags = formData.get("tags")?.toString();
	const resourceIds = formData.get("resourceIds")?.toString();
	const authorId = formData.get("authorId")?.toString();

	console.log(
		`url: ${request.url}, tags: ${tags}, resourceIds: ${resourceIds}, authorId: ${authorId}`,
	);

	// カンマ区切りの文字列を配列に変換（空の場合は空配列）
	const resourceIdArray = resourceIds
		? resourceIds.split(",").filter((id) => id.trim())
		: [];
	// authorIdを配列に変換（存在する場合のみ）
	const authorIdArray = authorId ? [authorId] : undefined;

	const response = await client.registerVideo(
		resourceIdArray,
		tags ?? "",
		authorIdArray,
	);
	if (isFailure(response)) {
		const error = response.value;
		console.log(`response error: ${getErrorMessage(error)}`);
		if (isErrorResponse(error)) {
			return { error } as ActionError;
		}
		throw new Error(getErrorMessage(error));
	}
	return redirect("/video/register");
}

export default function VideoRegisterPage() {
	const actionData = useActionData<ActionError>();
	const timestamp = useLoaderData<typeof loader>();

	const fieldErrors = isActionError(actionData)
		? actionData.error.type === "valid"
			? actionData.error.messages
			: undefined
		: undefined;

	const generalError =
		isActionError(actionData) && actionData.error.type !== "valid"
			? actionData.error.messages
			: undefined;

	return (
		<VideoRegisterTemplate
			key={timestamp}
			fieldErrors={fieldErrors}
			generalError={generalError}
		/>
	);
}
