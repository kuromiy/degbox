import type { Illust } from "../../../../features/illust/illust.model.js";
import { IllustEditTemplate } from "../../../../features/illust/ui/templates/illust.edit.template.js";
import { LayoutServer } from "../../../../features/shared/ui/components/layout.server.component.js";
import { ServerNavigationProvider } from "../../../../features/shared/ui/navigation.server.js";

type IllustEditPageProps = {
	illust: Illust;
};

export default function IllustEditPage({ illust }: IllustEditPageProps) {
	// サーバーサイドレンダリングではキャンセル機能は無効化
	const handleCancel = () => {
		console.warn("Cancel operation is not available in SSR mode");
	};

	return (
		<ServerNavigationProvider>
			<LayoutServer currentPath={`/illust/${illust.id}/edit`}>
				<IllustEditTemplate illust={illust} onCancel={handleCancel} />
			</LayoutServer>
		</ServerNavigationProvider>
	);
}
