import { isFailure } from "electron-flow/result";
import { useActionState } from "react";
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

			if (!resourceId || !tags) {
				return new Error("必須項目が入力されていません");
			}

			const response = await client.registerVideo(resourceId, tags, undefined);
			if (isFailure(response)) {
				return new Error(response.value.message);
			}
			return null;
		},
		null,
	);

	return (
		<main className="flex justify-center">
			<div className="w-full max-w-md">
				<form action={action} className="flex flex-col gap-4">
					<h1>動画登録</h1>
					<VideoInput />
					<TagInput />
					<div className="flex gap-4">
						<NeutralButton type="reset">リセット</NeutralButton>
						<PositiveButton type="submit">登録</PositiveButton>
					</div>
				</form>
			</div>
		</main>
	);
}
