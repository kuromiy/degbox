import { useNavigation } from "../navigation.context.js";

export function SideMenuItem({
	to,
	label,
	isActive,
}: {
	to: string;
	label: string;
	isActive: boolean;
}) {
	const { Link } = useNavigation();

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
