import { TagInput } from "../../../../features/tag/tag.input.component.js";

export default function VideoRegisterPage() {
	return (
		<main className="flex justify-center">
			<div className="w-full max-w-md">
				<form
					className="flex flex-col gap-4"
					method="POST"
					encType="multipart/form-data"
				>
					<h1>動画登録</h1>
					<label htmlFor="file">動画</label>
					<input
						type="file"
						name="file"
						accept="video/*"
						className="border rounded-lg p-2"
					/>
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
