import { isFailure } from "electron-flow/result";
import { type ActionFunctionArgs, useActionData } from "react-router-dom";
import {
	NeutralButton,
	PositiveButton,
} from "../../../features/shared/ui/button.component.js";
import { useNavigation } from "../../../features/shared/ui/navigation.context.js";
import {
	TagInput,
	useTagInput,
} from "../../../features/tag/ui/tag.input.component.js";
import { VideoInput } from "../../../features/video/ui/video.input.component.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const tags = formData.get("tags")?.toString();
	const resourceId = formData.get("resourceId")?.toString();

	console.log(`url: ${request.url}, tags: ${tags}, resourceId: ${resourceId}`);
	if (!resourceId || !tags) {
		console.log("必須項目が入力されていません");
		return new Error("必須項目が入力されていません");
	}

	const response = await client.registerVideo(resourceId, tags, undefined);
	if (isFailure(response)) {
		console.log(`response error: ${response.value.message}`);
		return new Error(response.value.message);
	}
	return location.reload();
}

export default function IndexPage() {
	const { Link, Form } = useNavigation();
	const { tags, add, replace, change, autocompleteTags, suggestTags } =
		useTagInput("");
	const data = useActionData() as { message: string } | Error | undefined;

	return (
		<main className="flex justify-center">
			{data && (
				<div className="mb-4">
					{data instanceof Error ? (
						<div className="text-red-500">エラー: {data.message}</div>
					) : (
						<div className="text-green-500">{data.message}</div>
					)}
				</div>
			)}
			<Link to="/">検索</Link>
			<div className="w-full max-w-md">
				<Form className="flex flex-col gap-4" method="POST">
					<h1>動画登録</h1>
					<VideoInput />
					<TagInput
						name="tags"
						value={tags}
						onAdd={add}
						onReplace={replace}
						onChange={change}
						autocompleteTags={autocompleteTags}
						suggestTags={suggestTags}
					/>
					<div className="flex gap-4">
						<NeutralButton type="reset">リセット</NeutralButton>
						<PositiveButton type="submit">登録</PositiveButton>
					</div>
				</Form>
			</div>
		</main>
	);
}
