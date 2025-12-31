import { isFailure } from "electron-flow/result";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
	useActionData,
	useLoaderData,
} from "react-router-dom";
import { IllustRegisterTemplate } from "../../../features/illust/ui/templates/illust.register.template.js";
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
	const tags = formData.get("tags")?.toString() ?? "";
	const resourceIds =
		formData.get("resourceIds")?.toString().split(",").filter(Boolean) ?? [];
	const authorIds = formData.getAll("authorIds").map(String);

	console.log(
		`url: ${request.url}, tags: ${tags}, resourceIds: ${resourceIds}, authorIds: ${authorIds}`,
	);

	const response = await client.registerIllust(resourceIds, tags, authorIds);
	if (isFailure(response)) {
		const error = response.value;
		console.log(`response error: ${getErrorMessage(error)}`);
		if (isErrorResponse(error)) {
			return { error } as ActionError;
		}
		throw new Error(getErrorMessage(error));
	}
	return redirect(`/illust/register`);
}

export default function IllustRegisterPage() {
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
		<IllustRegisterTemplate
			key={timestamp}
			fieldErrors={fieldErrors}
			generalError={generalError}
		/>
	);
}
