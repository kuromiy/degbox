import { Suspense } from "react";
import { createHashRouter } from "react-router-dom";
import AuthorRegisterPage, {
	action as authorRegisterAction,
} from "./pages/author.register.page.js";
import AuthorSearchPage, {
	loader as authorSearchLoader,
} from "./pages/author.search.page.js";
import VideoDetailPage, {
	loader as videoDetailLoader,
} from "./pages/video.detail.page.js";
import VideoRegisterPage, {
	action as videoRegisterAction,
} from "./pages/video.register.page.js";
import VideoSearchPage, {
	loader as videoSearchLoader,
} from "./pages/video.search.page.js";

export const route = createHashRouter([
	{
		path: "/register",
		element: <VideoRegisterPage />,
		action: videoRegisterAction,
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
	{
		path: "/author/register",
		element: <AuthorRegisterPage />,
		action: authorRegisterAction,
		HydrateFallback: () => <div>読み込み中...</div>,
	},
	{
		path: "/author/search",
		element: (
			<Suspense fallback={<div>読み込み中...</div>}>
				<AuthorSearchPage />
			</Suspense>
		),
		loader: authorSearchLoader,
		HydrateFallback: () => <div>読み込み中...</div>,
	},
]);
