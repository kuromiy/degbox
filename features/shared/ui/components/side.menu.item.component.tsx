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
			className={`block px-4 py-2 text-sm hover:bg-main-100 rounded transition-colors ${
				isActive ? "bg-main-100 text-main-700 font-semibold" : "text-gray-700 "
			}`}
		>
			{label}
		</Link>
	);
}
