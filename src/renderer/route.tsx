import { Suspense } from "react";
import { createHashRouter } from "react-router-dom";
import VideoDetailPage, {
	loader as videoDetailLoader,
} from "./pages/video.detail.page.js";
import VideoRegisterPage, { action } from "./pages/video.register.page.js";
import VideoSearchPage, {
	loader as videoSearchLoader,
} from "./pages/video.search.page.js";

export const route = createHashRouter([
	{
		path: "/register",
		element: <VideoRegisterPage />,
		action: action,
		HydrateFallback: () => <div>読み込み中...</div>,
	},
	{
		path: "/",
		element: (
			<Suspense fallback={<div>読み込み中...</div>}>
				<VideoSearchPage />
			</Suspense>
		),
		loader: videoSearchLoader,
		HydrateFallback: () => <div>読み込み中...</div>,
	},
	{
		path: "/video/:videoId",
		element: <VideoDetailPage />,
		loader: videoDetailLoader,
		HydrateFallback: () => <div>読み込み中...</div>,
	},
]);
