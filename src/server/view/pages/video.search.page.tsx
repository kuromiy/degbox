import { ServerNavigationProvider } from "../../../../features/shared/ui/navigation.server.js";
import { VideoSearchTemplate } from "../../../../features/video/ui/templates/video.search.template.js";
import type { Video } from "../../../../features/video/video.model.js";

type SearchResult = {
	count: number;
	result: Video[];
	page: number;
	size: number;
	keyword?: string;
};

type VideoSearchPageProps = {
	searchResult: SearchResult;
};

export default function VideoSearchPage({
	searchResult,
}: VideoSearchPageProps) {
	return (
		<ServerNavigationProvider>
			<VideoSearchTemplate data={searchResult} urlPrefix="/video/detail" />
		</ServerNavigationProvider>
	);
}
