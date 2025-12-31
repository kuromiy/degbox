import { useState } from "react";
import { FieldError } from "../../../../src/renderer/components/field-error.component.js";
import type { AuthorWithVideoCount } from "../../../author/author.model.js";
import { AuthorSelectModal } from "../../../author/ui/components/author.select.modal.component.js";
import {
	NeutralButton,
	PositiveButton,
} from "../../../shared/ui/components/button.component.js";
import { useNavigation } from "../../../shared/ui/navigation.context.js";
import { TagInput, useTagInput } from "../../../tag/ui/tag.input.component.js";
import { VideoContentInput } from "../components/video.content.input.component.js";

interface VideoRegisterTemplateProps {
	fieldErrors?: Record<string, string[]> | undefined;
	generalError?: string | undefined;
}

export function VideoRegisterTemplate({
	fieldErrors,
	generalError,
}: VideoRegisterTemplateProps) {
	const { Form } = useNavigation();
	const { tags, add, replace, change, reset, autocompleteTags, suggestTags } =
		useTagInput("");
	const [isOpen, setIsOpen] = useState(false);
	const [author, setAuthor] = useState<AuthorWithVideoCount | undefined>(
		undefined,
	);

	function handleReset() {
		setAuthor(undefined);
		reset();
	}

	return (
		<main className="flex justify-center">
			{isOpen && (
				<AuthorSelectModal
					onClose={() => setIsOpen(false)}
					onSelected={(author) => setAuthor(author)}
					{...(author?.id && { initialAuthorId: author.id })}
				/>
			)}
			<div className="w-full max-w-md">
				{generalError && (
					<div className="mb-4 rounded bg-red-100 p-3 text-red-700">
						{generalError}
					</div>
				)}
				<Form className="flex flex-col gap-4" method="POST">
					<h1>動画登録</h1>
					<div>
						<VideoContentInput />
						<FieldError errors={fieldErrors?.resourceIds} />
					</div>
					<div>
						<TagInput
							name="tags"
							value={tags}
							onAdd={add}
							onReplace={replace}
							onChange={change}
							autocompleteTags={autocompleteTags}
							suggestTags={suggestTags}
						/>
						<FieldError errors={fieldErrors?.tags} />
					</div>
					<div>
						<div className="flex justify-between divide-x divide-black rounded-lg border px-4 py-2">
							<div className="flex-1 pr-4">
								{author ? author.name : "未選択"}
							</div>
							<button
								type="button"
								onClick={() => setIsOpen(true)}
								className="pl-4"
							>
								選択
							</button>
						</div>
						<input
							type="hidden"
							name="authorId"
							value={author?.id ?? ""}
						></input>
						<FieldError errors={fieldErrors?.authorId} />
					</div>
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
