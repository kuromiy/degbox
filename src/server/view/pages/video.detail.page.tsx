import { ServerNavigationProvider } from "../../../../features/shared/ui/navigation.server.js";
import { VideoDetailTemplate } from "../../../../features/video/ui/templates/video.detail.template.js";
import type { Video } from "../../../../features/video/video.model.js";

type VideoDetailPageProps = {
	video: Video;
};

export default function VideoDetailPage({ video }: VideoDetailPageProps) {
	const firstContent = video.contents[0];
	const videoSrc = firstContent
		? `http://192.168.3.33:8080/file/${firstContent.path}/index.m3u8`
		: "";

	return (
		<ServerNavigationProvider>
			<VideoDetailTemplate
				video={video}
				videoSrc={videoSrc}
				backUrl="/video/search"
			/>
		</ServerNavigationProvider>
	);
}
