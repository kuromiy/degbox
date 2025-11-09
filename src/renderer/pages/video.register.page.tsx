import { isFailure } from "electron-flow/result";
import { useState } from "react";
import { type ActionFunctionArgs, useActionData } from "react-router-dom";
import type { AuthorWithVideoCount } from "../../../features/author/author.model.js";
import { AuthorSelectModal } from "../../../features/author/ui/components/author.select.modal.component.js";
import {
	NeutralButton,
	PositiveButton,
} from "../../../features/shared/ui/components/button.component.js";
import { useNavigation } from "../../../features/shared/ui/navigation.context.js";
import {
	TagInput,
	useTagInput,
} from "../../../features/tag/ui/tag.input.component.js";
import { VideoInput } from "../../../features/video/ui/components/video.input.component.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const tags = formData.get("tags")?.toString();
	const resourceId = formData.get("resourceId")?.toString();
	const authorId = formData.get("authorId")?.toString();

	console.log(
		`url: ${request.url}, tags: ${tags}, resourceId: ${resourceId}, authorId: ${authorId}`,
	);
	if (!resourceId || !tags) {
		console.log("必須項目が入力されていません");
		throw new Error("必須項目が入力されていません");
	}

	const response = await client.registerVideo(resourceId, tags, authorId);
	if (isFailure(response)) {
		console.log(`response error: ${response.value.message}`);
		throw new Error(response.value.message);
	}
	return location.reload();
}

export default function VideoRegisterPage() {
	const { Link, Form } = useNavigation();
	const { tags, add, replace, change, autocompleteTags, suggestTags } =
		useTagInput("");
	const data = useActionData() as { message: string } | Error | undefined;
	const [isOpen, setIsOpen] = useState(false);
	const [author, setAuthor] = useState<AuthorWithVideoCount | undefined>(
		undefined,
	);

	function handleReset() {
		setAuthor(undefined);
	}

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
			{isOpen && (
				<AuthorSelectModal
					onClose={() => setIsOpen(false)}
					onSelected={(author) => setAuthor(author)}
					{...(author?.id && { initialAuthorId: author.id })}
				/>
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
					<div className="flex justify-between divide-x divide-black px-4 py-2 border rounded-lg">
						<div className="flex-1 pr-4">{author ? author.name : "未選択"}</div>
						<button
							type="button"
							onClick={() => setIsOpen(true)}
							className="pl-4"
						>
							選択
						</button>
					</div>
					<input type="hidden" name="authorId" value={author?.id ?? ""}></input>
					<div className="flex gap-4">
						<NeutralButton type="reset" onClick={handleReset}>
							リセット
						</NeutralButton>
						<PositiveButton type="submit">登録</PositiveButton>
					</div>
				</Form>
			</div>
		</main>
	);
}
