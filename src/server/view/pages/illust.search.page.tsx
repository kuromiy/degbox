import type { Illust } from "../../../../features/illust/illust.model.js";
import { IllustSearchTemplate } from "../../../../features/illust/ui/templates/illust.search.template.js";
import { LayoutServer } from "../../../../features/shared/ui/components/layout.server.component.js";
import { ServerNavigationProvider } from "../../../../features/shared/ui/navigation.server.js";

type SearchResult = {
	items: Illust[];
	total: number;
	page: number;
	limit: number;
	hasNext: boolean;
	hasPrev: boolean;
	tag?: string;
	sortBy?: string;
	order?: string;
};

type IllustSearchPageProps = {
	searchResult: SearchResult;
};

export default function IllustSearchPage({
	searchResult,
}: IllustSearchPageProps) {
	return (
		<ServerNavigationProvider>
			<LayoutServer currentPath="/illust/search">
				<IllustSearchTemplate data={searchResult} urlPrefix="/illust/detail" />
			</LayoutServer>
		</ServerNavigationProvider>
	);
}
