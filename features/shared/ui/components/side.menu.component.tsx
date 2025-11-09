import { menuItems } from "../menu-items.js";
import { SideMenuItem } from "./side.menu.item.component.js";

export function SideMenu({ currentPath }: { currentPath: string }) {
	return (
		<aside className="w-60 h-screen bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
			<div className="p-4">
				<h1 className="text-xl font-bold text-main-500 mb-6">Degbox</h1>
				<nav className="space-y-6">
					{menuItems.map((category) => (
						<div key={category.category}>
							<h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
								{category.category}
							</h2>
							<div className="space-y-1">
								{category.items.map((item) => (
									<SideMenuItem
										key={item.to}
										{...item}
										isActive={currentPath === item.to}
									/>
								))}
							</div>
						</div>
					))}
				</nav>
			</div>
		</aside>
	);
}
