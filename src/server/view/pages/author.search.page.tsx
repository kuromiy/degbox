import type { AuthorWithVideoCount } from "../../../../features/author/author.model.js";
import { AuthorSearchTemplate } from "../../../../features/author/ui/templates/author.search.template.js";
import { LayoutServer } from "../../../../features/shared/ui/layout.server.js";
import { ServerNavigationProvider } from "../../../../features/shared/ui/navigation.server.js";

type SearchResult = {
	count: number;
	result: AuthorWithVideoCount[];
	page: number;
	size: number;
	name?: string | undefined;
};

type AuthorSearchPageProps = {
	searchResult: SearchResult;
};

export default function AuthorSearchPage({
	searchResult,
}: AuthorSearchPageProps) {
	return (
		<ServerNavigationProvider>
			<LayoutServer currentPath="/author/search">
				<AuthorSearchTemplate data={searchResult} />
			</LayoutServer>
		</ServerNavigationProvider>
	);
}
