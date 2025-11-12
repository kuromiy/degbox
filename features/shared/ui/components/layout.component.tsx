import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./header.component.js";
import { SideMenu } from "./side.menu.component.js";

/**
 * アプリケーション全体のレイアウトコンポーネント
 * ヘッダー、サイドメニュー、メインコンテンツ領域を持つ
 */
export function Layout() {
	const location = useLocation();
	// スマホ: 初期非表示、PC: Tailwindのmd:blockにより初期表示
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="flex h-screen flex-col overflow-hidden">
			<Header onMenuToggle={() => setIsOpen(!isOpen)} />
			<div className="flex flex-1 overflow-hidden">
				{/* サイドメニュー */}
				<SideMenu currentPath={location.pathname} isOpen={isOpen} />

				{/* メインコンテンツ */}
				<main className="flex-1 overflow-y-auto bg-gray-50">
					<div className="container mx-auto p-6">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
}
