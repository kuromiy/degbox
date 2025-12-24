import { useState } from "react";
import {
	NegativeButton,
	NeutralButton,
} from "../../../shared/ui/components/button.component.js";
import { useNavigation } from "../../../shared/ui/navigation.context.js";
import { TagList } from "../../../tag/ui/tag.list.component.js";
import type { Illust } from "../../illust.model.js";

export function IllustDetailTemplate({
	illust,
	backUrl,
	tagUrlPrefix = "/",
	onDelete,
}: {
	illust: Illust;
	backUrl: string;
	tagUrlPrefix?: string;
	onDelete?: () => Promise<void>;
}) {
	const { Link } = useNavigation();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const handleDelete = () => {
		setShowDeleteDialog(true);
	};

	const confirmDelete = async () => {
		try {
			if (onDelete) {
				await onDelete();
			} else {
				// サーバー版: 直接APIを呼び出し
				const response = await fetch(`/illust/detail/${illust.id}/delete`, {
					method: "POST",
				});
				if (!response.ok) {
					throw new Error("削除に失敗しました");
				}
				// 検索画面へ遷移
				window.location.href = "/illust/search";
			}
		} catch (_error) {
			alert("削除に失敗しました");
		} finally {
			setShowDeleteDialog(false);
		}
	};

	const cancelDelete = () => {
		setShowDeleteDialog(false);
	};

	return (
		<main className="container mx-auto px-2 pt-10">
			{/* 削除確認ダイアログ */}
			{showDeleteDialog && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="rounded-lg bg-white p-6 shadow-xl">
						<h3 className="mb-4 font-bold text-lg">イラストの削除</h3>
						<p className="mb-6 text-gray-700">
							このイラストを削除しますか？
							<br />
							この操作は取り消せません。
						</p>
						<div className="flex justify-end gap-4">
							<NeutralButton onClick={cancelDelete}>キャンセル</NeutralButton>
							<NegativeButton onClick={confirmDelete}>削除</NegativeButton>
						</div>
					</div>
				</div>
			)}

			<div className="mb-6">
				<Link
					to={backUrl}
					className="text-blue-500 transition-colors hover:text-blue-700"
				>
					← 検索に戻る
				</Link>
			</div>

			{/* イラスト画像（複数対応） */}
			<div className="mb-8 space-y-6">
				{illust.contents.map((illustContent, index) => (
					<div
						key={illustContent.content.id}
						className="rounded-lg border bg-white p-4 shadow-sm"
					>
						<div className="mb-3 flex items-center justify-between">
							<h3 className="font-semibold text-lg">
								画像 {index + 1}/{illust.contents.length}
							</h3>
							{index === 0 && (
								<span className="rounded bg-blue-100 px-2 py-1 text-blue-800 text-xs">
									サムネイル
								</span>
							)}
						</div>
						<div className="flex justify-center">
							<img
								src={illustContent.content.path}
								alt={`イラスト ${index + 1}`}
								className="max-h-[80vh] max-w-full object-contain"
							/>
						</div>
					</div>
				))}
			</div>

			{/* タグ一覧 */}
			<div className="mb-8">
				<h2 className="mb-4 font-bold text-xl">タグ</h2>
				<TagList tags={illust.tags} urlPrefix={tagUrlPrefix} />
			</div>

			{/* 画像情報 */}
			<div className="rounded-lg bg-gray-50 p-6">
				<h2 className="mb-4 font-bold text-xl">画像情報</h2>

				<div className="mb-4">
					<h3 className="mb-2 font-semibold text-gray-600 text-sm">
						イラストID
					</h3>
					<p className="text-gray-800">{illust.id}</p>
				</div>

				{illust.authors.length > 0 && (
					<div className="mb-4">
						<h3 className="mb-2 font-semibold text-gray-600 text-sm">作者</h3>
						<div className="flex flex-wrap gap-2">
							{illust.authors.map((author) => (
								<span
									key={author.id}
									className="rounded-full bg-gray-200 px-3 py-1 text-sm"
								>
									{author.name}
								</span>
							))}
						</div>
					</div>
				)}

				{illust.contents.length > 0 && (
					<div className="mb-6">
						<h3 className="mb-2 font-semibold text-gray-600 text-sm">
							ファイル名
						</h3>
						<div className="space-y-1">
							{illust.contents.map((illustContent) => (
								<div
									key={illustContent.content.id}
									className="text-gray-600 text-sm"
								>
									{illustContent.content.path}
								</div>
							))}
						</div>
					</div>
				)}

				{/* 編集・削除ボタン */}
				<div className="flex gap-4 border-t pt-6">
					<Link to={`/illust/${illust.id}/edit`} className="flex-1">
						<NeutralButton className="w-full">編集</NeutralButton>
					</Link>
					<NegativeButton onClick={handleDelete} className="flex-1">
						削除
					</NegativeButton>
				</div>
			</div>
		</main>
	);
}
