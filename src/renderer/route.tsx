import { createHashRouter } from "react-router-dom";
import IndexPage from "./pages/index.page.js";

export const route = createHashRouter([
	{
		path: "/",
		element: <IndexPage />,
	},
]);
