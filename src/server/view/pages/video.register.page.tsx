import {
	NeutralButton,
	PositiveButton,
} from "../../../../features/shared/ui/button.component.js";
import { TagInput } from "../../../../features/tag/ui/tag.input.component.js";

export default function VideoRegisterPage(
	formData?: Record<string, unknown>,
	errors?: Record<string, string[]>,
) {
	const fileErrors = errors?.file;
	const tagsErrors = errors?.tags;
	const authorIdErrors = errors?.authorId;

	const hasFileError = !!(fileErrors && fileErrors.length > 0);
	const hasTagsError = !!(tagsErrors && tagsErrors.length > 0);
	const hasAuthorIdError = !!(authorIdErrors && authorIdErrors.length > 0);

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
					<div className="flex flex-col gap-1">
						<TagInput
							defaultValue={formData?.tags as string}
							hasError={hasTagsError}
						/>
						{hasTagsError && (
							<div className="text-red-500 text-sm">
								{tagsErrors.map((error) => (
									<div key={error}>{error}</div>
								))}
							</div>
						)}
					</div>

					{/* 作者ID入力フィールド（オプション） */}
					<div className="flex flex-col gap-1">
						<label htmlFor="authorId">作者ID（オプション）</label>
						<input
							type="text"
							name="authorId"
							defaultValue={formData?.authorId as string}
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
