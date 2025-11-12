/**
 * ヘッダーコンポーネント
 * ハンバーガーメニューボタンとDegboxロゴを表示
 */
export function Header({ onMenuToggle }: { onMenuToggle: () => void }) {
	return (
		<header className="flex h-16 items-center border-gray-200 border-b bg-white px-4 shadow-sm">
			{/* ハンバーガーメニューボタン */}
			<button
				type="button"
				onClick={onMenuToggle}
				className="mr-4 rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
				aria-label="メニューを開く"
			>
				<svg
					className="h-6 w-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					role="img"
					aria-label="メニューアイコン"
				>
					<title>メニュー</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>

			{/* Degboxロゴ */}
			<h1 className="font-bold text-main-500 text-xl">Degbox</h1>
		</header>
	);
}
