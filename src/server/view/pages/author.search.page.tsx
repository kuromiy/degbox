import type { AuthorWithVideoCount } from "../../../../features/author/author.model.js";
import { AuthorSearchTemplate } from "../../../../features/author/ui/templates/author.search.template.js";
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
			<AuthorSearchTemplate data={searchResult} />
		</ServerNavigationProvider>
	);
}
