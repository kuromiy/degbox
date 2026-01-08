import { isFailure } from "electron-flow/result";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
	useActionData,
	useLoaderData,
	useNavigate,
} from "react-router-dom";
import { AuthorEditTemplate } from "../../../../features/author/ui/templates/author.edit.template.js";
import { ApiService } from "../../autogenerate/register.js";
import {
	type ActionError,
	getErrorMessage,
	isActionError,
	isErrorResponse,
} from "../../utils/error.js";

const client = new ApiService();

export async function loader({ params }: LoaderFunctionArgs) {
	const { authorId } = params;
	if (!authorId) {
		throw new Error("Author ID is required");
	}

	const response = await client.getAuthorDetail(authorId, 1, 20);
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
	const name = formData.get("name")?.toString() ?? "";
	const urls = formData.get("urls")?.toString() || "{}";

	console.log(`id: ${authorId}, name: ${name}, urls: ${urls}`);

	const response = await client.updateAuthor(authorId, name, urls);
	if (isFailure(response)) {
		const error = response.value;
		console.log(`response error: ${getErrorMessage(error)}`);
		if (isErrorResponse(error)) {
			return { error } as ActionError;
		}
		throw new Error(getErrorMessage(error));
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
		navigate(`/author/${author.id}`);
	};

	return (
		<AuthorEditTemplate
			author={author}
			onCancel={handleCancel}
			fieldErrors={fieldErrors}
			generalError={generalError}
		/>
	);
}
