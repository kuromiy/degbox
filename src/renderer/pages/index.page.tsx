import { isFailure } from "electron-flow/result";
import { useActionState } from "react";
import { TagInput } from "../../../features/tag/tag.input.component.js";
import { VideoInput } from "../../../features/video/video.input.component.js";
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
						<button type="reset" className="px-4 py-2 border rounded-lg">
							リセット
						</button>
						<button type="submit" className="px-4 py-2 border rounded-lg">
							登録
						</button>
					</div>
				</form>
			</div>
		</main>
	);
}
