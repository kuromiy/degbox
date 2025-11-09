import { menuItems } from "./menu-items.js";
import { SideMenuItem } from "./side-menu-item.js";

/**
 * サイドメニューコンポーネント
 */
export function SideMenu() {
	return (
		<aside className="w-60 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-y-auto">
			<div className="p-4">
				<h1 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
					Degbox
				</h1>
				<nav className="space-y-6">
					{menuItems.map((category) => (
						<div key={category.category}>
							<h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
								{category.category}
							</h2>
							<div className="space-y-1">
								{category.items.map((item) => (
									<SideMenuItem key={item.to} {...item} />
								))}
							</div>
						</div>
					))}
				</nav>
			</div>
		</aside>
	);
}
