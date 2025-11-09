import { AuthorDetailTemplate } from "../../../../features/author/ui/templates/author.detail.template.js";
import { LayoutServer } from "../../../../features/shared/ui/components/layout.server.component.js";
import { ServerNavigationProvider } from "../../../../features/shared/ui/navigation.server.js";
import type { AuthorDetailResponse } from "../../../../src/main/apis/authors/author.detail.api.js";

type AuthorDetailPageProps = {
	authorDetail: AuthorDetailResponse;
};

export default function AuthorDetailPage({
	authorDetail,
}: AuthorDetailPageProps) {
	// サーバーサイドレンダリングでは削除機能は無効化
	const handleDelete = () => {
		console.warn("Delete operation is not available in SSR mode");
	};

	return (
		<ServerNavigationProvider>
			<LayoutServer currentPath={`/author/detail/${authorDetail.id}`}>
				<AuthorDetailTemplate
					author={{
						id: authorDetail.id,
						name: authorDetail.name,
						urls: authorDetail.urls,
					}}
					videos={authorDetail.videos}
					onDelete={handleDelete}
				/>
			</LayoutServer>
		</ServerNavigationProvider>
	);
}
