import { useLocation } from "react-router-dom";
import type { MenuItem } from "./menu-items.js";
import { useNavigation } from "./navigation.context.js";

/**
 * サイドメニュー項目コンポーネント
 */
export function SideMenuItem({ to, label }: MenuItem) {
	const { Link } = useNavigation();
	const location = useLocation();

	// React RouterのuseLocationを使用して現在のパスを取得
	const isActive = location.pathname === to;

	return (
		<Link
			to={to}
			className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors ${
				isActive
					? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold"
					: "text-gray-700 dark:text-gray-300"
			}`}
		>
			{label}
		</Link>
	);
}
