import { Outlet } from "react-router-dom";
import { SideMenu } from "./side-menu.js";

/**
 * アプリケーション全体のレイアウトコンポーネント
 * サイドメニューとメインコンテンツ領域を持つ
 */
export function Layout() {
	return (
		<div className="flex h-screen overflow-hidden">
			<SideMenu />
			<main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
				<div className="container mx-auto p-6">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
