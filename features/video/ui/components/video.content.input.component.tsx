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

export function VideoContentInput() {
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

	async function pickupVideo() {
		const response = await client.pickupVideo();
		if (isFailure(response)) {
			const errorMessage =
				response.value instanceof Error
					? response.value.message
					: "動画の読み込みに失敗しました";
			setError(errorMessage);
			return;
		}

		// 複数選択対応
		const values = Array.isArray(response.value)
			? response.value
			: [response.value];

		setContentFiles((prev) => {
			const newFiles = values.map(
				(item: { id: string; name: string }, index: number) => ({
					id: crypto.randomUUID(),
					resourceId: item.id,
					name: item.name,
					order: prev.length + index,
				}),
			);
			return [...prev, ...newFiles];
		});
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

			<NeutralButton type="button" onClick={pickupVideo}>
				動画を選択
			</NeutralButton>

			{error && <p className="text-red-600 text-sm">{error}</p>}

			{contentFiles.length > 0 && (
				<div className="space-y-2">
					{contentFiles.map((file, index) => (
						<div
							key={file.id}
							className="flex items-center gap-4 rounded-lg border p-4"
						>
							<video
								src={`resources://${file.resourceId}`}
								className="h-24 w-32 rounded object-cover"
								controls={false}
								muted
							/>
							<div className="flex-1">
								<p className="text-sm">{file.name}</p>
								<p className="text-gray-500 text-xs">
									順序: {index + 1}
									{index === 0 && " (サムネイル/GIF生成元)"}
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
