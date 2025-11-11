import { Suspense } from "react";
import { createHashRouter, Navigate } from "react-router-dom";
import { Layout } from "../../features/shared/ui/components/layout.component.js";
import AuthorDetailPage, {
	loader as authorDetailLoader,
} from "./pages/author.detail.page.js";
import AuthorEditPage, {
	action as authorEditAction,
	loader as authorEditLoader,
} from "./pages/author.edit.page.js";
import AuthorRegisterPage, {
	action as authorRegisterAction,
} from "./pages/author.register.page.js";
import AuthorSearchPage, {
	loader as authorSearchLoader,
} from "./pages/author.search.page.js";
import IllustRegisterPage, {
	action as illustRegisterAction,
} from "./pages/illust.register.page.js";
import IllustSearchPage, {
	loader as illustSearchLoader,
} from "./pages/illust.search.page.js";
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
		element: <Layout />,
		children: [
			{
				path: "/",
				element: <Navigate to="/video/search" replace />,
			},
			{
				path: "/video/search",
				element: (
					<Suspense fallback={<div>読み込み中...</div>}>
						<VideoSearchPage />
					</Suspense>
				),
				loader: videoSearchLoader,
				HydrateFallback: () => <div>読み込み中...</div>,
			},
			{
				path: "/video/register",
				element: <VideoRegisterPage />,
				action: videoRegisterAction,
				HydrateFallback: () => <div>読み込み中...</div>,
			},
			{
				path: "/video/:videoId",
				element: <VideoDetailPage />,
				loader: videoDetailLoader,
				HydrateFallback: () => <div>読み込み中...</div>,
			},
			{
				path: "/illust/search",
				element: (
					<Suspense fallback={<div>読み込み中...</div>}>
						<IllustSearchPage />
					</Suspense>
				),
				loader: illustSearchLoader,
				HydrateFallback: () => <div>読み込み中...</div>,
			},
			{
				path: "/illust/register",
				element: <IllustRegisterPage />,
				action: illustRegisterAction,
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
			{
				path: "/author/:authorId",
				element: (
					<Suspense fallback={<div>読み込み中...</div>}>
						<AuthorDetailPage />
					</Suspense>
				),
				loader: authorDetailLoader,
				HydrateFallback: () => <div>読み込み中...</div>,
			},
			{
				path: "/author/:authorId/edit",
				element: (
					<Suspense fallback={<div>読み込み中...</div>}>
						<AuthorEditPage />
					</Suspense>
				),
				loader: authorEditLoader,
				action: authorEditAction,
				HydrateFallback: () => <div>読み込み中...</div>,
			},
		],
	},
]);
