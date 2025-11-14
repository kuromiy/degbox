import { isFailure } from "electron-flow/result";
import { Suspense } from "react";
import { type LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { VideoDetailTemplate } from "../../../features/video/ui/templates/video.detail.template.js";
import type { Video } from "../../../features/video/video.model.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export async function loader({ params }: LoaderFunctionArgs) {
	const videoId = params.videoId;
	if (!videoId) {
		throw new Error("not found videoId");
	}
	const response = await client.detailVideo(videoId);
	if (isFailure(response)) {
		throw response.value;
	}
	return response.value;
}

export default function VideoDetailPage() {
	const video = useLoaderData<Video>();

	return (
		<Suspense fallback={<div>読み込み中...</div>}>
			<VideoDetailTemplate video={video} backUrl="/" />
		</Suspense>
	);
}
