import { useCallback, useState } from "react";
import type { AuthorWithVideoCount } from "../../../../features/author/author.model.js";
import { AuthorSelectModal } from "../../../../features/author/ui/components/author.select.modal.component.js";
import { ClientProvider } from "../../../../features/shared/ui/client.context.js";
import {
	NegativeButton,
	NeutralButton,
	PositiveButton,
} from "../../../../features/shared/ui/components/button.component.js";
import { LayoutServer } from "../../../../features/shared/ui/components/layout.server.component.js";
import { ServerNavigationProvider } from "../../../../features/shared/ui/navigation.server.js";
import {
	TagInput,
	useTagInput,
} from "../../../../features/tag/ui/tag.input.component.js";
import { FetchClient } from "../../client.js";

function IllustRegisterForm({
	fileErrors,
}: {
	fileErrors?: string[] | undefined;
}) {
	const hasFileError = !!(fileErrors && fileErrors.length > 0);
	const [isOpen, setIsOpen] = useState(false);
	const [authors, setAuthors] = useState<AuthorWithVideoCount[]>([]);

	// ClientProvider の内側で useTagInput を呼び出す
	const { tags, add, replace, change, autocompleteTags, suggestTags } =
		useTagInput("");

	function handleAddAuthor(author: AuthorWithVideoCount) {
		if (!authors.find((a) => a.id === author.id)) {
			setAuthors([...authors, author]);
		}
		setIsOpen(false);
	}

	function handleRemoveAuthor(authorId: string) {
		setAuthors(authors.filter((a) => a.id !== authorId));
	}

	return (
		<main className="flex justify-center">
			<div className="w-full max-w-2xl">
				{isOpen && (
					<AuthorSelectModal
						onClose={() => setIsOpen(false)}
						onSelected={handleAddAuthor}
					/>
				)}
				<form
					className="flex flex-col gap-4"
					method="POST"
					encType="multipart/form-data"
				>
					<h1>イラスト登録</h1>

					{/* ファイル入力フィールド */}
					<div className="flex flex-col gap-1">
						<label htmlFor="files">画像（複数選択可）</label>
						<input
							type="file"
							name="files"
							accept="image/*"
							multiple
							className={`rounded-lg border p-2 ${hasFileError ? "border-red-500" : ""}`}
						/>
						{hasFileError && (
							<div className="text-red-500 text-sm">
								{fileErrors.map((error) => (
									<div key={error}>{error}</div>
								))}
							</div>
						)}
					</div>

					{/* タグ入力フィールド */}
					{/* biome-ignore lint/correctness/useUniqueElementIds: Fixed ID needed to prevent hydration mismatch */}
					<TagInput
						name="tags"
						value={tags}
						onAdd={add}
						onReplace={replace}
						onChange={change}
						autocompleteTags={autocompleteTags}
						suggestTags={suggestTags}
						id="illust-tags-input"
					/>

					{/* 作者入力フィールド（オプション） */}
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
					</div>

					<div className="flex gap-4">
						<NeutralButton type="reset">リセット</NeutralButton>
						<PositiveButton type="submit">登録</PositiveButton>
					</div>
				</form>
			</div>
		</main>
	);
}

export default function IllustRegisterPage(
	_formData?: Record<string, unknown>,
	errors?: Record<string, string[]>,
) {
	// files, files.0, files.1 などのすべてのファイル関連エラーを集約
	const fileErrors = Object.entries(errors || {})
		.filter(([key]) => key.startsWith("files"))
		.flatMap(([, messages]) => messages);

	const createClient = useCallback(() => new FetchClient(), []);

	return (
		<ServerNavigationProvider>
			<LayoutServer currentPath="/illust/register">
				<ClientProvider createClient={createClient}>
					<IllustRegisterForm fileErrors={fileErrors} />
				</ClientProvider>
			</LayoutServer>
		</ServerNavigationProvider>
	);
}
