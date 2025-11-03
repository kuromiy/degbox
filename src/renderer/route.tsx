import { Suspense } from "react";
import { createHashRouter } from "react-router-dom";
import VideoDetailPage from "./pages/video.detail.page.js";
import VideoRegisterPage, { action } from "./pages/video.register.page.js";
import VideoSearchPage from "./pages/video.search.page.js";

export const route = createHashRouter([
	{
		path: "/register",
		element: <VideoRegisterPage />,
		action: action,
	},
	{
		path: "/",
		element: (
			<Suspense fallback={<div>読み込み中...</div>}>
				<VideoSearchPage />
			</Suspense>
		),
	},
	{
		path: "/video/:videoId",
		element: <VideoDetailPage />,
	},
]);
