import { AuthorRegisterTemplate } from "../../../../features/author/ui/templates/author.register.template.js";
import { ServerNavigationProvider } from "../../../../features/shared/ui/navigation.server.js";

export default function AuthorRegisterPage() {
	return (
		<ServerNavigationProvider>
			<AuthorRegisterTemplate />
		</ServerNavigationProvider>
	);
}
