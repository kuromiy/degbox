import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ClientNavigationProvider } from "../../features/shared/ui/navigation.client.js";
import { route } from "./route.js";

const appElement = document.getElementById("app");
if (!appElement) {
	throw new Error("App element not found");
}
const root = createRoot(appElement);
root.render(
	<React.StrictMode>
		<ClientNavigationProvider>
			<RouterProvider router={route} />
		</ClientNavigationProvider>
	</React.StrictMode>,
);
