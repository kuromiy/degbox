import { useState } from "react";
import { FieldError } from "../../../../src/renderer/components/field-error.component.js";
import type { AuthorWithVideoCount } from "../../../author/author.model.js";
import { AuthorSelectModal } from "../../../author/ui/components/author.select.modal.component.js";
import {
	NegativeButton,
	NeutralButton,
	PositiveButton,
} from "../../../shared/ui/components/button.component.js";
import { useNavigation } from "../../../shared/ui/navigation.context.js";
import { TagInput, useTagInput } from "../../../tag/ui/tag.input.component.js";
import { IllustContentInput } from "../components/illust.content.input.component.js";

interface IllustRegisterTemplateProps {
	fieldErrors?: Record<string, string[]> | undefined;
	generalError?: string | undefined;
}

export function IllustRegisterTemplate({
	fieldErrors,
	generalError,
}: IllustRegisterTemplateProps) {
	const { Form } = useNavigation();
	const { tags, add, replace, change, autocompleteTags, suggestTags } =
		useTagInput("");
	const [isOpen, setIsOpen] = useState(false);
	const [authors, setAuthors] = useState<AuthorWithVideoCount[]>([]);

	function handleAddAuthor(author: AuthorWithVideoCount) {
		if (!authors.find((a) => a.id === author.id)) {
			setAuthors([...authors, author]);
		}
		setIsOpen(false);
	}

	function handleRemoveAuthor(authorId: string) {
		setAuthors(authors.filter((a) => a.id !== authorId));
	}

	function handleReset() {
		setAuthors([]);
	}

	return (
		<main className="flex justify-center">
			{isOpen && (
				<AuthorSelectModal
					onClose={() => setIsOpen(false)}
					onSelected={handleAddAuthor}
				/>
			)}
			<div className="w-full max-w-2xl">
				{generalError && (
					<div className="mb-4 rounded bg-red-100 p-3 text-red-700">
						{generalError}
					</div>
				)}
				<Form className="flex flex-col gap-4" method="POST">
					<h1>イラスト登録</h1>

					<div>
						<IllustContentInput />
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
						<div className="mb-2 font-medium text-sm">作者（オプション）</div>
						<NeutralButton type="button" onClick={() => setIsOpen(true)}>
							作者を追加
						</NeutralButton>

						{authors.length > 0 && (
							<div className="mt-4 space-y-2">
								{authors.map((author) => (
									<div
										key={author.id}
										className="flex items-center justify-between rounded-lg border p-4"
									>
										<div>
											<p className="font-medium">{author.name}</p>
										</div>
										<NegativeButton
											type="button"
											onClick={() => handleRemoveAuthor(author.id)}
										>
											削除
										</NegativeButton>
									</div>
								))}
							</div>
						)}

						{authors.map((author) => (
							<input
								key={author.id}
								type="hidden"
								name="authorIds"
								value={author.id}
							/>
						))}
						<FieldError errors={fieldErrors?.authorIds} />
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
