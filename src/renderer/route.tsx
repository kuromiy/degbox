import { Suspense } from "react";
import { createHashRouter, Navigate } from "react-router-dom";
import { Layout } from "../../features/shared/ui/components/layout.component.js";
import AppSettingPage, {
	action as appsettingAction,
	loader as appsettingLoader,
} from "./pages/app.setting.page.js";
import AuthorDetailPage, {
	loader as authorDetailLoader,
} from "./pages/author/author.detail.page.js";
import AuthorEditPage, {
	action as authorEditAction,
	loader as authorEditLoader,
} from "./pages/author/author.edit.page.js";
import AuthorRegisterPage, {
	action as authorRegisterAction,
	loader as authorRegisterLoader,
} from "./pages/author/author.register.page.js";
import AuthorSearchPage, {
	loader as authorSearchLoader,
} from "./pages/author/author.search.page.js";
import DuplicateDetailPage, {
	loader as duplicateDetailLoader,
} from "./pages/duplicate.detail.page.js";
import DuplicateListPage, {
	loader as duplicateListLoader,
} from "./pages/duplicate.list.page.js";
import IllustDetailPage, {
	loader as illustDetailLoader,
} from "./pages/illust/illust.detail.page.js";
import IllustEditPage, {
	action as illustEditAction,
	loader as illustEditLoader,
} from "./pages/illust/illust.edit.page.js";
import IllustRegisterPage, {
	action as illustRegisterAction,
	loader as illustRegisterLoader,
} from "./pages/illust/illust.register.page.js";
import IllustSearchPage, {
	loader as illustSearchLoader,
} from "./pages/illust/illust.search.page.js";
import VideoDetailPage, {
	loader as videoDetailLoader,
} from "./pages/video/video.detail.page.js";
import VideoRegisterPage, {
	action as videoRegisterAction,
	loader as videoRegisterLoader,
} from "./pages/video/video.register.page.js";
import VideoSearchPage, {
	loader as videoSearchLoader,
} from "./pages/video/video.search.page.js";

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
				loader: videoRegisterLoader,
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
				loader: illustRegisterLoader,
				HydrateFallback: () => <div>読み込み中...</div>,
			},
			{
				path: "/illust/:illustId",
				element: <IllustDetailPage />,
				loader: illustDetailLoader,
				HydrateFallback: () => <div>読み込み中...</div>,
			},
			{
				path: "/illust/:illustId/edit",
				element: (
					<Suspense fallback={<div>読み込み中...</div>}>
						<IllustEditPage />
					</Suspense>
				),
				loader: illustEditLoader,
				action: illustEditAction,
				HydrateFallback: () => <div>読み込み中...</div>,
			},
			{
				path: "/author/register",
				element: <AuthorRegisterPage />,
				action: authorRegisterAction,
				loader: authorRegisterLoader,
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
			{
				path: "/appsettings",
				element: (
					<Suspense fallback={<div>読み込み中...</div>}>
						<AppSettingPage />
					</Suspense>
				),
				loader: appsettingLoader,
				action: appsettingAction,
				HydrateFallback: () => <div>読み込み中...</div>,
			},
			{
				path: "/duplicate",
				element: (
					<Suspense fallback={<div>読み込み中...</div>}>
						<DuplicateListPage />
					</Suspense>
				),
				loader: duplicateListLoader,
				HydrateFallback: () => <div>読み込み中...</div>,
			},
			{
				path: "/duplicate/:groupId",
				element: (
					<Suspense fallback={<div>読み込み中...</div>}>
						<DuplicateDetailPage />
					</Suspense>
				),
				loader: duplicateDetailLoader,
				HydrateFallback: () => <div>読み込み中...</div>,
			},
		],
	},
]);
