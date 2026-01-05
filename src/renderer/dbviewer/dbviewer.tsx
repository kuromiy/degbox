import React from "react";
import { createRoot } from "react-dom/client";
import { DbViewerApp } from "./dbviewer.app.js";

const appElement = document.getElementById("app");
if (!appElement) {
	throw new Error("App element not found");
}

const root = createRoot(appElement);
root.render(
	<React.StrictMode>
		<DbViewerApp />
	</React.StrictMode>,
);
