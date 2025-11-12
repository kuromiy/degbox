import type React from "react";
import { useState } from "react";
import { Header } from "./header.component.js";
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
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div className="flex h-screen flex-col overflow-hidden">
			<Header onMenuToggle={() => setIsOpen(!isOpen)} />
			<div className="flex flex-1 overflow-hidden">
				{/* サイドメニュー */}
				<SideMenu currentPath={currentPath} isOpen={isOpen} />

				{/* メインコンテンツ */}
				<main className="flex-1 overflow-y-auto bg-gray-50">
					<div className="container mx-auto p-6">{children}</div>
				</main>
			</div>
		</div>
	);
}
