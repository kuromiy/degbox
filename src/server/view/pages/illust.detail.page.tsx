import type { Illust } from "../../../../features/illust/illust.model.js";
import { IllustDetailTemplate } from "../../../../features/illust/ui/templates/illust.detail.template.js";
import { LayoutServer } from "../../../../features/shared/ui/components/layout.server.component.js";
import { ServerNavigationProvider } from "../../../../features/shared/ui/navigation.server.js";

type IllustDetailPageProps = {
	illust: Illust;
};

export default function IllustDetailPage({ illust }: IllustDetailPageProps) {
	return (
		<ServerNavigationProvider>
			<LayoutServer currentPath={`/illust/detail/${illust.id}`}>
				<IllustDetailTemplate
					illust={illust}
					backUrl="/illust/search"
					tagUrlPrefix="/illust/search"
				/>
			</LayoutServer>
		</ServerNavigationProvider>
	);
}
