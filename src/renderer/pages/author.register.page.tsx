import { isFailure } from "electron-flow/result";
import type { ActionFunctionArgs } from "react-router-dom";
import { AuthorRegisterTemplate } from "../../../features/author/ui/templates/author.register.template.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const name = formData.get("name")?.toString();
	const urls = formData.get("urls")?.toString() || "{}";

	console.log(`name: ${name}, urls: ${urls}`);
	if (!name) {
		console.log("必須項目が入力されていません");
		throw new Error("必須項目が入力されていません");
	}

	const response = await client.registerAuthor(name, urls);
	if (isFailure(response)) {
		console.log(`response error: ${response.value.message}`);
		throw new Error(response.value.message);
	}
	return location.reload();
}

export default function AuthorRegisterPage() {
	return <AuthorRegisterTemplate />;
}
