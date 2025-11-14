import { isFailure } from "electron-flow/result";
import { useEffect, useRef, useState } from "react";
import { ApiService } from "../../../../src/renderer/autogenerate/register.js";

const client = new ApiService();

type VideoFile = {
	id: string;
	name: string;
};

export function VideoInput() {
	const ref = useRef<HTMLInputElement>(null);

	const [videos, setVideos] = useState<VideoFile[]>([]);

	useEffect(() => {
		const form = ref.current?.form;
		if (!form) return;

		function reset() {
			setVideos([]);
		}

		form.addEventListener("reset", reset);
		return () => form.removeEventListener("reset", reset);
	}, []);

	async function pickupVideo() {
		const response = await client.pickupVideo();
		if (isFailure(response)) {
			return;
		}
		// 配列として扱う
		const values = Array.isArray(response.value)
			? response.value
			: [response.value];
		setVideos(values);
	}

	return (
		<>
			{videos.length > 0 && (
				<div className="space-y-2">
					{videos.map((video, index) => (
						<div key={video.id}>
							<video controls className="aspect-video w-full">
								<source src={`resources://${video.id}`} />
								<track kind="captions" srcLang="ja" label="日本語字幕" />
							</video>
							<p className="text-gray-600 text-sm">
								{index + 1}. {video.name}
							</p>
						</div>
					))}
				</div>
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
				value={videos[0]?.id ?? ""}
			/>
		</>
	);
}
