import { menuItems } from "../menu-items.js";
import { SideMenuItem } from "./side.menu.item.component.js";

export function SideMenu({ currentPath }: { currentPath: string }) {
	return (
		<aside className="h-screen w-60 flex-shrink-0 overflow-y-auto border-gray-200 border-r bg-white">
			<div className="p-4">
				<h1 className="mb-6 font-bold text-main-500 text-xl">Degbox</h1>
				<nav className="space-y-6">
					{menuItems.map((category) => (
						<div key={category.category}>
							<h2 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
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
