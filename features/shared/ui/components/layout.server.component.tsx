import type React from "react";
import { SideMenu } from "./side.menu.component.js";

/**
 * アプリケーション全体のレイアウトコンポーネント（Server側）
 * サイドメニューとメインコンテンツ領域を持つ
 */
export function LayoutServer({
	children,
	currentPath,
}: {
	children: React.ReactNode;
	currentPath: string;
}) {
	return (
		<div className="flex h-screen overflow-hidden">
			<SideMenu currentPath={currentPath} />
			<main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
				<div className="container mx-auto p-6">{children}</div>
			</main>
		</div>
	);
}
