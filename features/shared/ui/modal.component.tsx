import type { ReactNode } from "react";

export function Modal({
	children,
	onExternal,
}: {
	children: ReactNode;
	onExternal: () => void;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* オーバーレイ */}
			<button
				type="button"
				className="absolute inset-0 bg-black/50 cursor-default"
				onClick={onExternal}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						onExternal();
					}
				}}
				aria-label="モーダルを閉じる"
			/>

			{/* コンテンツ */}
			<div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
				{children}
			</div>
		</div>
	);
}
