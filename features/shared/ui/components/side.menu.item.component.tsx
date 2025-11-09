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
			className={`block rounded px-4 py-2 text-sm transition-colors hover:bg-main-100 ${
				isActive ? "bg-main-100 font-semibold text-main-700" : "text-gray-700"
			}`}
		>
			{label}
		</Link>
	);
}
