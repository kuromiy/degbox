import { useCallback } from "react";
import {
	NeutralButton,
	PositiveButton,
} from "../../../../features/shared/ui/button.component.js";
import { ClientProvider } from "../../../../features/shared/ui/client.context.js";
import {
	TagInput,
	useTagInput,
} from "../../../../features/tag/ui/tag.input.component.js";
import { FetchClient } from "../../client.js";

function VideoRegisterForm({
	fileErrors,
	authorIdErrors,
}: {
	fileErrors?: string[] | undefined;
	authorIdErrors?: string[] | undefined;
}) {
	const hasFileError = !!(fileErrors && fileErrors.length > 0);
	const hasAuthorIdError = !!(authorIdErrors && authorIdErrors.length > 0);

	// ClientProvider の内側で useTagInput を呼び出す
	const { tags, add, replace, change, autocompleteTags, suggestTags } =
		useTagInput("");

	return (
		<main className="flex justify-center">
			<div className="w-full max-w-md">
				<form
					className="flex flex-col gap-4"
					method="POST"
					encType="multipart/form-data"
				>
					<h1>動画登録</h1>

					{/* ファイル入力フィールド */}
					<div className="flex flex-col gap-1">
						<label htmlFor="file">動画</label>
						<input
							type="file"
							name="file"
							accept="video/*"
							className={`border rounded-lg p-2 ${hasFileError ? "border-red-500" : ""}`}
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
						id="video-tags-input"
					/>

					{/* 作者ID入力フィールド（オプション） */}
					<div className="flex flex-col gap-1">
						<label htmlFor="authorId">作者ID（オプション）</label>
						<input
							type="text"
							name="authorId"
							className={`border rounded-lg p-2 ${hasAuthorIdError ? "border-red-500" : ""}`}
						/>
						{hasAuthorIdError && (
							<div className="text-red-500 text-sm">
								{authorIdErrors.map((error) => (
									<div key={error}>{error}</div>
								))}
							</div>
						)}
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

export default function VideoRegisterPage(
	_formData?: Record<string, unknown>,
	errors?: Record<string, string[]>,
) {
	const fileErrors = errors?.file;
	const authorIdErrors = errors?.authorId;

	const createClient = useCallback(() => new FetchClient(), []);

	return (
		<ClientProvider createClient={createClient}>
			<VideoRegisterForm
				fileErrors={fileErrors}
				authorIdErrors={authorIdErrors}
			/>
		</ClientProvider>
	);
}
