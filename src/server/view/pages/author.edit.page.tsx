import { AuthorEditTemplate } from "../../../../features/author/ui/templates/author.edit.template.js";
import { LayoutServer } from "../../../../features/shared/ui/components/layout.server.component.js";
import { ServerNavigationProvider } from "../../../../features/shared/ui/navigation.server.js";

type AuthorEditPageProps = {
	author: {
		id: string;
		name: string;
		urls: Record<string, string>;
	};
};

export default function AuthorEditPage({ author }: AuthorEditPageProps) {
	// サーバーサイドレンダリングではキャンセル機能は無効化
	const handleCancel = () => {
		console.warn("Cancel operation is not available in SSR mode");
	};

	return (
		<ServerNavigationProvider>
			<LayoutServer currentPath={`/author/${author.id}/edit`}>
				<AuthorEditTemplate author={author} onCancel={handleCancel} />
			</LayoutServer>
		</ServerNavigationProvider>
	);
}
