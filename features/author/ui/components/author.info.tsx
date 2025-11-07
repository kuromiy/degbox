import { useState } from "react";
import { useNavigation } from "../../../shared/ui/navigation.context.js";
import type { Author } from "../../author.model.js";

interface AuthorInfoProps {
	author: Author;
	onDelete: () => void;
}

// URLのキーに応じてアイコンを表示
const urlIcons: Record<string, string> = {
	twitter: "🐦",
	youtube: "📺",
	official: "🌐",
	pixiv: "🎨",
	x: "🐦",
	facebook: "📘",
	instagram: "📷",
	tiktok: "🎵",
};

export default function AuthorInfo({ author, onDelete }: AuthorInfoProps) {
	const { Link } = useNavigation();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const handleDeleteClick = () => {
		setShowDeleteDialog(true);
	};

	const handleConfirmDelete = () => {
		setShowDeleteDialog(false);
		onDelete();
	};

	const handleCancelDelete = () => {
		setShowDeleteDialog(false);
	};

	return (
		<div className="bg-white border border-gray-200 rounded-lg shadow p-6">
			<div className="flex flex-col gap-4">
				<h1 className="text-3xl font-bold text-gray-900">{author.name}</h1>

				<div className="flex flex-col gap-2">
					<h2 className="text-lg font-semibold text-gray-700">外部リンク</h2>
					{Object.keys(author.urls).length === 0 ? (
						<div className="text-gray-500">外部リンクなし</div>
					) : (
						<div className="flex flex-col gap-2">
							{Object.entries(author.urls).map(([platform, url]) => (
								<a
									key={platform}
									href={url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
								>
									<span>{urlIcons[platform.toLowerCase()] || "🔗"}</span>
									<span>{platform}</span>: {url}
								</a>
							))}
						</div>
					)}
				</div>

				<div className="flex gap-2 mt-4">
					<Link
						to={`/author/${author.id}/edit`}
						className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md hover:shadow-lg"
					>
						編集
					</Link>
					<button
						type="button"
						onClick={handleDeleteClick}
						className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md hover:shadow-lg"
					>
						削除
					</button>
				</div>
			</div>

			{showDeleteDialog && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
						<h3 className="text-xl font-bold text-gray-900 mb-4">作者の削除</h3>
						<p className="text-gray-700 mb-2">
							「{author.name}」を削除しますか?
						</p>
						<p className="text-gray-600 mb-6">この操作は取り消せません。</p>
						<div className="flex gap-2 justify-end">
							<button
								type="button"
								onClick={handleCancelDelete}
								className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors duration-200"
							>
								キャンセル
							</button>
							<button
								type="button"
								onClick={handleConfirmDelete}
								className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200"
							>
								削除
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
