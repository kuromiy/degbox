import { isFailure } from "electron-flow/result";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
	useActionData,
	useLoaderData,
} from "react-router-dom";
import { AuthorRegisterTemplate } from "../../../../features/author/ui/templates/author.register.template.js";
import { ApiService } from "../../autogenerate/register.js";
import {
	type ActionError,
	getErrorMessage,
	isActionError,
	isErrorResponse,
} from "../../utils/error.js";

const client = new ApiService();

export function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const timestamp = url.searchParams.get("timestamp") ?? Date.now().toString();
	return timestamp;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const name = formData.get("name")?.toString();
	const urls = formData.get("urls")?.toString() || "{}";

	console.log(`name: ${name}, urls: ${urls}`);

	const response = await client.registerAuthor(name ?? "", urls);
	if (isFailure(response)) {
		const error = response.value;
		console.log(`response error: ${getErrorMessage(error)}`);
		if (isErrorResponse(error)) {
			return { error } as ActionError;
		}
		throw new Error(getErrorMessage(error));
	}
	return redirect("/author/register");
}

export default function AuthorRegisterPage() {
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
		<AuthorRegisterTemplate
			key={timestamp}
			fieldErrors={fieldErrors}
			generalError={generalError}
		/>
	);
}
