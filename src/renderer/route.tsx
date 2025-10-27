import { Suspense } from "react";
import { createHashRouter } from "react-router-dom";
import IndexPage from "./pages/index.page.js";
import VideoSearchPage from "./pages/video.search.page.js";

export const route = createHashRouter([
	{
		path: "/register",
		element: <IndexPage />,
	},
	{
		path: "/",
		element: (
			<Suspense fallback={<div>読み込み中...</div>}>
				<VideoSearchPage />
			</Suspense>
		),
	},
]);
