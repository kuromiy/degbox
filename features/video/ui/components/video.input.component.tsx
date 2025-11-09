import { isFailure } from "electron-flow/result";
import { useEffect, useRef, useState } from "react";
import { ApiService } from "../../../../src/renderer/autogenerate/register.js";

const client = new ApiService();

export function VideoInput() {
	const ref = useRef<HTMLInputElement>(null);

	const [resourceId, setResourceId] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);

	useEffect(() => {
		const form = ref.current?.form;
		if (!form) return;

		function reset() {
			setResourceId(null);
			setFileName(null);
		}

		form.addEventListener("reset", reset);
		return () => form.removeEventListener("reset", reset);
	}, []);

	async function pickupVideo() {
		const response = await client.pickupVideo();
		if (isFailure(response)) {
			return;
		}
		setResourceId(response.value.id);
		setFileName(response.value.name);
	}

	return (
		<>
			{resourceId && (
				<>
					<video controls className="aspect-video w-full">
						<source src={`resources://${resourceId}`} />
						<track kind="captions" srcLang="ja" label="日本語字幕" />
					</video>
					{fileName && (
						<p className="text-gray-600 text-sm">選択: {fileName}</p>
					)}
				</>
			)}
			<div className="font-medium text-sm">動画</div>
			<button
				type="button"
				onClick={pickupVideo}
				className="rounded-lg border px-4 py-2"
			>
				動画を選択
			</button>
			<input
				ref={ref}
				type="hidden"
				name="resourceId"
				value={resourceId ?? ""}
			/>
		</>
	);
}
