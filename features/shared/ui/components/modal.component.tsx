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
				className="absolute inset-0 cursor-default bg-black/50"
				onClick={onExternal}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						onExternal();
					}
				}}
				aria-label="モーダルを閉じる"
			/>

			{/* コンテンツ */}
			<div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
				{children}
			</div>
		</div>
	);
}
