import { useState } from "react";
import { useNavigation } from "../../../shared/ui/navigation.context.js";
import type { Author } from "../../author.model.js";

interface AuthorInfoProps {
	author: Author;
	onDelete: () => void | Promise<void>;
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
		void onDelete();
	};

	const handleCancelDelete = () => {
		setShowDeleteDialog(false);
	};

	return (
		<div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
			<div className="flex flex-col gap-4">
				<h1 className="font-bold text-3xl text-gray-900">{author.name}</h1>

				<div className="flex flex-col gap-2">
					<h2 className="font-semibold text-gray-700 text-lg">外部リンク</h2>
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

				<div className="mt-4 flex gap-2">
					<Link
						to={`/author/${author.id}/edit`}
						className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-600 hover:shadow-lg"
					>
						編集
					</Link>
					<button
						type="button"
						onClick={handleDeleteClick}
						className="rounded-lg bg-red-500 px-6 py-2 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-red-600 hover:shadow-lg"
					>
						削除
					</button>
				</div>
			</div>

			{showDeleteDialog && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
						<h3 className="mb-4 font-bold text-gray-900 text-xl">作者の削除</h3>
						<p className="mb-2 text-gray-700">
							「{author.name}」を削除しますか?
						</p>
						<p className="mb-6 text-gray-600">この操作は取り消せません。</p>
						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={handleCancelDelete}
								className="rounded-lg bg-gray-300 px-4 py-2 font-semibold text-gray-800 transition-colors duration-200 hover:bg-gray-400"
							>
								キャンセル
							</button>
							<button
								type="button"
								onClick={handleConfirmDelete}
								className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition-colors duration-200 hover:bg-red-600"
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
