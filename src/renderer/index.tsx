import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ClientContext } from "../../features/shared/ui/client.context.js";
import { ClientNavigationProvider } from "../../features/shared/ui/navigation.client.js";
import { ApiService } from "./autogenerate/register.js";
import { route } from "./route.js";

const appElement = document.getElementById("app");
if (!appElement) {
	throw new Error("App element not found");
}
const client = new ApiService();
const root = createRoot(appElement);
root.render(
	<React.StrictMode>
		<ClientContext value={client}>
			<ClientNavigationProvider>
				<RouterProvider router={route} />
			</ClientNavigationProvider>
		</ClientContext>
	</React.StrictMode>,
);
