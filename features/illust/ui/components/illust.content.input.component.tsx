import { isFailure } from "electron-flow/result";
import { useEffect, useRef, useState } from "react";
import { ApiService } from "../../../../src/renderer/autogenerate/register.js";
import {
	NegativeButton,
	NeutralButton,
} from "../../../shared/ui/components/button.component.js";

const client = new ApiService();

type ContentFile = {
	id: string;
	resourceId: string;
	name: string;
	order: number;
};

export function IllustContentInput() {
	const ref = useRef<HTMLInputElement>(null);
	const [contentFiles, setContentFiles] = useState<ContentFile[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const form = ref.current?.form;
		if (!form) return;

		function reset() {
			setContentFiles([]);
			setError(null);
		}

		form.addEventListener("reset", reset);
		return () => form.removeEventListener("reset", reset);
	}, []);

	async function pickupImage() {
		const response = await client.pickupImage();
		if (isFailure(response)) {
			return;
		}

		// 複数選択対応
		const newFiles = response.value.map(
			(item: { id: string; name: string }, index: number) => ({
				id: crypto.randomUUID(),
				resourceId: item.id,
				name: item.name,
				order: contentFiles.length + index,
			}),
		);

		setContentFiles([...contentFiles, ...newFiles]);
		setError(null);
	}

	function moveUp(index: number) {
		if (index === 0) return;

		const items = [...contentFiles];
		const prev = items[index - 1];
		const curr = items[index];
		if (!prev || !curr) return;
		[items[index - 1], items[index]] = [curr, prev];

		const reordered = items.map((item, i) => ({
			...item,
			order: i,
		}));

		setContentFiles(reordered);
	}

	function moveDown(index: number) {
		if (index === contentFiles.length - 1) return;

		const items = [...contentFiles];
		const curr = items[index];
		const next = items[index + 1];
		if (!curr || !next) return;
		[items[index], items[index + 1]] = [next, curr];

		const reordered = items.map((item, i) => ({
			...item,
			order: i,
		}));

		setContentFiles(reordered);
	}

	function removeFile(id: string) {
		const newFiles = contentFiles.filter((f) => f.id !== id);
		const reordered = newFiles.map((file, index) => ({
			...file,
			order: index,
		}));
		setContentFiles(reordered);
	}

	return (
		<>
			<div className="font-medium text-sm">コンテンツファイル（必須）</div>

			<NeutralButton type="button" onClick={pickupImage}>
				画像を選択
			</NeutralButton>

			{error && <p className="text-red-600 text-sm">{error}</p>}

			{contentFiles.length > 0 && (
				<div className="space-y-2">
					{contentFiles.map((file, index) => (
						<div
							key={file.id}
							className="flex items-center gap-4 rounded-lg border p-4"
						>
							<img
								src={`resources://${file.resourceId}`}
								alt={file.name}
								className="h-24 w-24 rounded object-cover"
							/>
							<div className="flex-1">
								<p className="text-sm">{file.name}</p>
								<p className="text-gray-500 text-xs">
									順序: {index + 1}
									{index === 0 && " (サムネイル)"}
								</p>
							</div>
							<div className="flex gap-2">
								<NeutralButton
									type="button"
									onClick={() => moveUp(index)}
									disabled={index === 0}
								>
									↑
								</NeutralButton>
								<NeutralButton
									type="button"
									onClick={() => moveDown(index)}
									disabled={index === contentFiles.length - 1}
								>
									↓
								</NeutralButton>
								<NegativeButton
									type="button"
									onClick={() => removeFile(file.id)}
								>
									削除
								</NegativeButton>
							</div>
						</div>
					))}
				</div>
			)}

			<input
				ref={ref}
				type="hidden"
				name="resourceIds"
				value={contentFiles.map((f) => f.resourceId).join(",")}
			/>
		</>
	);
}
