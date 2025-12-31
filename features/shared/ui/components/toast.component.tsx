export type ToastType = "success" | "error" | "info" | "warning";

type ToastProps = {
	id: string;
	type: ToastType;
	message: string;
	onClose: (id: string) => void;
};

const typeStyles: Record<ToastType, string> = {
	success: "bg-green-500 text-white",
	error: "bg-red-500 text-white",
	info: "bg-blue-500 text-white",
	warning: "bg-yellow-500 text-black",
};

const typeIcons: Record<ToastType, string> = {
	success: "✓",
	error: "✕",
	info: "ℹ",
	warning: "⚠",
};

export function Toast({ id, type, message, onClose }: ToastProps) {
	return (
		<div
			className={`flex min-w-72 items-center gap-3 rounded-lg px-4 py-3 shadow-lg ${typeStyles[type]}`}
			role="alert"
		>
			<span className="text-lg">{typeIcons[type]}</span>
			<span className="flex-1">{message}</span>
			<button
				type="button"
				onClick={() => onClose(id)}
				className="ml-2 opacity-70 transition-opacity hover:opacity-100"
				aria-label="閉じる"
			>
				✕
			</button>
		</div>
	);
}
