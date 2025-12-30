import { isFailure } from "electron-flow/result";
import { useState } from "react";
import { type ActionFunctionArgs, useActionData } from "react-router-dom";
import type { AuthorWithVideoCount } from "../../../features/author/author.model.js";
import { AuthorSelectModal } from "../../../features/author/ui/components/author.select.modal.component.js";
import { IllustContentInput } from "../../../features/illust/ui/components/illust.content.input.component.js";
import {
	NegativeButton,
	NeutralButton,
	PositiveButton,
} from "../../../features/shared/ui/components/button.component.js";
import { useNavigation } from "../../../features/shared/ui/navigation.context.js";
import {
	TagInput,
	useTagInput,
} from "../../../features/tag/ui/tag.input.component.js";
import { ApiService } from "../autogenerate/register.js";
import { FieldError } from "../components/field-error.component.js";
import {
	type ActionError,
	getErrorMessage,
	isActionError,
	isErrorResponse,
} from "../utils/error.js";

const client = new ApiService();

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const tags = formData.get("tags")?.toString() ?? "";
	const resourceIds =
		formData.get("resourceIds")?.toString().split(",").filter(Boolean) ?? [];
	const authorIds = formData.getAll("authorIds").map(String);

	console.log(
		`url: ${request.url}, tags: ${tags}, resourceIds: ${resourceIds}, authorIds: ${authorIds}`,
	);

	const response = await client.registerIllust(resourceIds, tags, authorIds);
	if (isFailure(response)) {
		const error = response.value;
		console.log(`response error: ${getErrorMessage(error)}`);
		if (isErrorResponse(error)) {
			return { error } as ActionError;
		}
		throw new Error(getErrorMessage(error));
	}
	return location.reload();
}

export default function IllustRegisterPage() {
	const { Form } = useNavigation();
	const { tags, add, replace, change, autocompleteTags, suggestTags } =
		useTagInput("");
	const actionData = useActionData<ActionError>();
	const [isOpen, setIsOpen] = useState(false);
	const [authors, setAuthors] = useState<AuthorWithVideoCount[]>([]);

	const fieldErrors = isActionError(actionData)
		? actionData.error.type === "valid"
			? actionData.error.messages
			: undefined
		: undefined;

	const generalError =
		isActionError(actionData) && actionData.error.type !== "valid"
			? actionData.error.messages
			: undefined;

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
