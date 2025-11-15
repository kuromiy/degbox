import { useState } from "react";
import type { AuthorWithVideoCount } from "../../../author/author.model.js";
import { AuthorSelectModal } from "../../../author/ui/components/author.select.modal.component.js";
import {
	NegativeButton,
	NeutralButton,
	PositiveButton,
} from "../../../shared/ui/components/button.component.js";
import { useNavigation } from "../../../shared/ui/navigation.context.js";
import { TagInput, useTagInput } from "../../../tag/ui/tag.input.component.js";
import type { Illust } from "../../illust.model.js";
import { IllustEditImageManager } from "../components/illust.edit.image.manager.component.js";

interface IllustEditTemplateProps {
	illust: Illust;
	onCancel: () => void;
}

export function IllustEditTemplate({
	illust,
	onCancel,
}: IllustEditTemplateProps) {
	const { Form } = useNavigation();
	const initialTags = illust.tags.map((t) => t.name).join(", ");
	const { tags, add, replace, change, autocompleteTags, suggestTags } =
		useTagInput(initialTags);
	const [isOpen, setIsOpen] = useState(false);
	const [authors, setAuthors] = useState<AuthorWithVideoCount[]>(
		illust.authors as AuthorWithVideoCount[],
	);
	const [showCancelConfirm, setShowCancelConfirm] = useState(false);

	function handleAddAuthor(author: AuthorWithVideoCount) {
		if (!authors.find((a) => a.id === author.id)) {
			setAuthors([...authors, author]);
		}
		setIsOpen(false);
	}

	function handleRemoveAuthor(authorId: string) {
		setAuthors(authors.filter((a) => a.id !== authorId));
	}

	function handleCancel() {
		setShowCancelConfirm(true);
	}

	function confirmCancel() {
		setShowCancelConfirm(false);
		onCancel();
	}

	function cancelCancel() {
		setShowCancelConfirm(false);
	}

	return (
		<main className="flex justify-center px-4 pt-10">
			{/* 作者選択モーダル */}
			{isOpen && (
				<AuthorSelectModal
					onClose={() => setIsOpen(false)}
					onSelected={handleAddAuthor}
				/>
			)}

			{/* キャンセル確認ダイアログ */}
			{showCancelConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="rounded-lg bg-white p-6 shadow-xl">
						<h3 className="mb-4 font-bold text-lg">編集のキャンセル</h3>
						<p className="mb-6 text-gray-700">
							変更内容を破棄してもよろしいですか？
						</p>
						<div className="flex justify-end gap-4">
							<NeutralButton type="button" onClick={cancelCancel}>
								戻る
							</NeutralButton>
							<NegativeButton type="button" onClick={confirmCancel}>
								破棄する
							</NegativeButton>
						</div>
					</div>
				</div>
			)}

			<div className="w-full max-w-2xl">
				<Form className="flex flex-col gap-6" method="POST">
					<h1 className="font-bold text-2xl">イラスト編集</h1>

					{/* 画像管理 */}
					<div className="rounded-lg border bg-white p-6 shadow-sm">
						<IllustEditImageManager initialContents={illust.contents} />
					</div>

					{/* タグ選択 */}
					<div className="rounded-lg border bg-white p-6 shadow-sm">
						<TagInput
							name="tags"
							value={tags}
							onAdd={add}
							onReplace={replace}
							onChange={change}
							autocompleteTags={autocompleteTags}
							suggestTags={suggestTags}
						/>
					</div>

					{/* 作者選択 */}
					<div className="rounded-lg border bg-white p-6 shadow-sm">
						<div className="mb-4 font-medium text-sm">作者（オプション）</div>
						<NeutralButton type="button" onClick={() => setIsOpen(true)}>
							作者を追加
						</NeutralButton>

						{authors.length > 0 && (
							<div className="mt-4 space-y-2">
								{authors.map((author) => (
									<div
										key={author.id}
										className="flex items-center justify-between rounded-lg border p-4"
									>
										<div>
											<p className="font-medium">{author.name}</p>
										</div>
										<NegativeButton
											type="button"
											onClick={() => handleRemoveAuthor(author.id)}
										>
											削除
										</NegativeButton>
									</div>
								))}
							</div>
						)}

						{authors.map((author) => (
							<input
								key={author.id}
								type="hidden"
								name="authorIds"
								value={author.id}
							/>
						))}
					</div>

					{/* 操作ボタン */}
					<div className="flex gap-4 border-t pt-6">
						<NeutralButton
							type="button"
							onClick={handleCancel}
							className="flex-1"
						>
							キャンセル
						</NeutralButton>
						<PositiveButton type="submit" className="flex-1">
							保存
						</PositiveButton>
					</div>
				</Form>
			</div>
		</main>
	);
}
