import { LayoutServer } from "../../../../features/shared/ui/components/layout.server.component.js";
import { ServerNavigationProvider } from "../../../../features/shared/ui/navigation.server.js";
import { VideoDetailTemplate } from "../../../../features/video/ui/templates/video.detail.template.js";
import type { Video } from "../../../../features/video/video.model.js";

type VideoDetailPageProps = {
	video: Video;
};

export default function VideoDetailPage({ video }: VideoDetailPageProps) {
	return (
		<ServerNavigationProvider>
			<LayoutServer currentPath={`/video/detail/${video.id}`}>
				<VideoDetailTemplate
					video={video}
					backUrl="/video/search"
					tagUrlPrefix="/video/search"
				/>
			</LayoutServer>
		</ServerNavigationProvider>
	);
}
