import { isFailure } from "electron-flow/result";
import { useActionState } from "react";
import { Link } from "react-router-dom";
import {
	NeutralButton,
	PositiveButton,
} from "../../../features/shared/ui/button.component.js";
import {
	TagInput,
	useTagInput,
} from "../../../features/tag/ui/tag.input.component.js";
import { VideoInput } from "../../../features/video/ui/video.input.component.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export default function IndexPage() {
	const { tags, add, replace, change, reset, autocompleteTags, suggestTags } =
		useTagInput("");

	const [_, action] = useActionState<Error | null, FormData>(
		async (_, formData) => {
			const tags = formData.get("tags")?.toString();
			const resourceId = formData.get("resourceId")?.toString();

			console.log(`tags: ${tags}, resourceId: ${resourceId}`);
			if (!resourceId || !tags) {
				console.log("必須項目が入力されていません");
				return new Error("必須項目が入力されていません");
			}

			const response = await client.registerVideo(resourceId, tags, undefined);
			if (isFailure(response)) {
				console.log(`response error: ${response.value.message}`);
				return new Error(response.value.message);
			}
			return null;
		},
		null,
	);

	return (
		<main className="flex justify-center">
			<Link to="/">検索</Link>
			<div className="w-full max-w-md">
				<form action={action} className="flex flex-col gap-4">
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
				</form>
			</div>
		</main>
	);
}
