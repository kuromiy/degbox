import React from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import ProjectSelectPage, {
	loader as projectSelectLoader,
} from "./pages/project.select.page.js";

export const route = createHashRouter([
	{
		path: "/",
		element: <ProjectSelectPage />,
		loader: projectSelectLoader,
		HydrateFallback: () => <div>読み込み中...</div>,
	},
]);

const appElement = document.getElementById("app");
if (!appElement) {
	throw new Error("App element not found");
}
const root = createRoot(appElement);
root.render(
	<React.StrictMode>
		<RouterProvider router={route} />
	</React.StrictMode>,
);
