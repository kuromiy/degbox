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
	errors?: Record<string, string[]>;
};

export default function VideoSearchPage({
	searchResult,
	errors,
}: VideoSearchPageProps) {
	const queryErrors = errors?.query;
	const _hasQueryError = !!(queryErrors && queryErrors.length > 0);

	return (
		<ServerNavigationProvider>
			<VideoSearchTemplate data={searchResult} urlPrefix="/video/detail" />
		</ServerNavigationProvider>
	);
}
