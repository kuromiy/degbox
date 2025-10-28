import { isFailure, isSuccess } from "electron-flow/result";
import { useActionState } from "react";
import { Link } from "react-router-dom";
import {
	NeutralButton,
	PositiveButton,
} from "../../../features/shared/ui/button.component.js";
import { TagInput } from "../../../features/tag/ui/tag.input.component.js";
import { VideoInput } from "../../../features/video/ui/video.input.component.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export default function IndexPage() {
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

	// TagInput用のAPIクライアントアダプター
	const tagApiClient = {
		autocompleteTags: async (value: string, limit?: number) => {
			const result = await client.autocompleteTags(value, limit);
			if (isSuccess(result)) {
				return result.value;
			}
			console.error("Autocomplete error:", result.value);
			return [];
		},
		suggestRelatedTags: async (tagNames: string[], limit?: number) => {
			const result = await client.suggestRelatedTags(tagNames, limit);
			if (isSuccess(result)) {
				return result.value;
			}
			console.error("Related tags error:", result.value);
			return [];
		},
	};

	return (
		<main className="flex justify-center">
			<Link to="/">検索</Link>
			<div className="w-full max-w-md">
				<form action={action} className="flex flex-col gap-4">
					<h1>動画登録</h1>
					<VideoInput />
					<TagInput apiClient={tagApiClient} />
					<div className="flex gap-4">
						<NeutralButton type="reset">リセット</NeutralButton>
						<PositiveButton type="submit">登録</PositiveButton>
					</div>
				</form>
			</div>
		</main>
	);
}
