import { useNavigation } from "../navigation.context.js";

export interface PaginationProps {
	currentPage: number;
	totalPages: number;
	baseUrl?: string;
	queryParams?: Record<string, string | number>;
}

export function Pagination({
	currentPage,
	totalPages,
	baseUrl = "",
	queryParams = {},
}: PaginationProps) {
	const { Link } = useNavigation();

	// ページ番号配列を生成
	const getPageNumbers = (): (number | "ellipsis")[] => {
		if (totalPages <= 7) {
			// 7ページ以下の場合はすべて表示
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const pages: (number | "ellipsis")[] = [];

		if (currentPage <= 4) {
			// 現在ページが先頭付近（1-4ページ）
			pages.push(1, 2, 3, 4, 5, "ellipsis", totalPages);
		} else if (currentPage >= totalPages - 3) {
			// 現在ページが末尾付近
			pages.push(
				1,
				"ellipsis",
				totalPages - 4,
				totalPages - 3,
				totalPages - 2,
				totalPages - 1,
				totalPages,
			);
		} else {
			// 現在ページが中間
			pages.push(
				1,
				"ellipsis",
				currentPage - 1,
				currentPage,
				currentPage + 1,
				"ellipsis",
				totalPages,
			);
		}

		return pages;
	};

	// URLを生成
	const buildUrl = (page: number): string => {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(queryParams)) {
			params.set(key, String(value));
		}
		params.set("page", String(page));
		return `${baseUrl}?${params.toString()}`;
	};

	const pageNumbers = getPageNumbers();
	const isFirstPage = currentPage === 1;
	const isLastPage = currentPage === totalPages;

	return (
		<nav
			className="flex items-center justify-center gap-1 mt-8"
			aria-label="ページネーション"
		>
			{/* 最初のページへ */}
			<Link
				to={buildUrl(1)}
				className={`px-3 py-2 rounded-lg transition-colors ${
					isFirstPage
						? "text-gray-300 cursor-not-allowed pointer-events-none"
						: "text-gray-700 hover:bg-gray-100"
				}`}
				aria-label="最初のページ"
				aria-disabled={isFirstPage}
			>
				&lt;&lt;
			</Link>

			{/* 前のページへ */}
			<Link
				to={buildUrl(currentPage - 1)}
				className={`px-3 py-2 rounded-lg transition-colors ${
					isFirstPage
						? "text-gray-300 cursor-not-allowed pointer-events-none"
						: "text-gray-700 hover:bg-gray-100"
				}`}
				aria-label="前のページ"
				aria-disabled={isFirstPage}
			>
				&lt;
			</Link>

			{/* ページ番号 */}
			{pageNumbers.map((pageNum, index) => {
				if (pageNum === "ellipsis") {
					return (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: ellipsisは位置固定のため配列インデックスを使用
							key={`ellipsis-${index}`}
							className="px-3 py-2 text-gray-500"
						>
							...
						</span>
					);
				}

				const isCurrentPage = pageNum === currentPage;

				return (
					<Link
						key={pageNum}
						to={buildUrl(pageNum)}
						className={`px-3 py-2 rounded-lg transition-colors ${
							isCurrentPage
								? "bg-main-500 text-white font-semibold cursor-default pointer-events-none"
								: "text-gray-700 hover:bg-gray-100"
						}`}
						aria-label={`ページ${pageNum}`}
						aria-current={isCurrentPage ? "page" : undefined}
					>
						{pageNum}
					</Link>
				);
			})}

			{/* 次のページへ */}
			<Link
				to={buildUrl(currentPage + 1)}
				className={`px-3 py-2 rounded-lg transition-colors ${
					isLastPage
						? "text-gray-300 cursor-not-allowed pointer-events-none"
						: "text-gray-700 hover:bg-gray-100"
				}`}
				aria-label="次のページ"
				aria-disabled={isLastPage}
			>
				&gt;
			</Link>

			{/* 最後のページへ */}
			<Link
				to={buildUrl(totalPages)}
				className={`px-3 py-2 rounded-lg transition-colors ${
					isLastPage
						? "text-gray-300 cursor-not-allowed pointer-events-none"
						: "text-gray-700 hover:bg-gray-100"
				}`}
				aria-label="最後のページ"
				aria-disabled={isLastPage}
			>
				&gt;&gt;
			</Link>
		</nav>
	);
}
