import { AuthorRegisterTemplate } from "../../../../features/author/ui/templates/author.register.template.js";
import { LayoutServer } from "../../../../features/shared/ui/layout.server.js";
import { ServerNavigationProvider } from "../../../../features/shared/ui/navigation.server.js";

export default function AuthorRegisterPage() {
	return (
		<ServerNavigationProvider>
			<LayoutServer currentPath="/author/register">
				<AuthorRegisterTemplate />
			</LayoutServer>
		</ServerNavigationProvider>
	);
}
