import { isFailure } from "electron-flow/result";
import { useState } from "react";
import { ApiService } from "../../../../src/renderer/autogenerate/register.js";
import {
	NegativeButton,
	NeutralButton,
} from "../../../shared/ui/components/button.component.js";
import type { IllustContent } from "../../illust.model.js";

const client = new ApiService();

type ImageItem = {
	id: string;
	contentId?: string; // 既存コンテンツの場合はcontentId
	resourceId?: string; // 新規コンテンツの場合はresourceId
	name: string;
	url: string;
	order: number;
	isExisting: boolean;
};

interface IllustEditImageManagerProps {
	initialContents: IllustContent[];
}

export function IllustEditImageManager({
	initialContents,
}: IllustEditImageManagerProps) {
	const [images, setImages] = useState<ImageItem[]>(
		initialContents.map((ic, index) => ({
			id: crypto.randomUUID(),
			contentId: ic.content.id,
			name: ic.content.name,
			url: ic.content.path,
			order: index,
			isExisting: true,
		})),
	);
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

	async function addImages() {
		const response = await client.pickupImage();
		if (isFailure(response)) {
			return;
		}

		// 複数選択対応
		const newImagesData = response.value.map(
			(item: { id: string; name: string }) => ({
				id: crypto.randomUUID(),
				resourceId: item.id,
				name: item.name,
			}),
		);

		setImages((prev) => [
			...prev,
			...newImagesData.map((item, index) => ({
				...item,
				url: `resources://${item.resourceId}`,
				order: prev.length + index,
				isExisting: false,
			})),
		]);
	}

	function moveUp(index: number) {
		if (index === 0) return;

		const items = [...images];
		const prev = items[index - 1];
		const curr = items[index];
		if (!prev || !curr) return;
		[items[index - 1], items[index]] = [curr, prev];

		const reordered = items.map((item, i) => ({
			...item,
			order: i,
		}));

		setImages(reordered);
	}

	function moveDown(index: number) {
		if (index === images.length - 1) return;

		const items = [...images];
		const curr = items[index];
		const next = items[index + 1];
		if (!curr || !next) return;
		[items[index], items[index + 1]] = [next, curr];

		const reordered = items.map((item, i) => ({
			...item,
			order: i,
		}));

		setImages(reordered);
	}

	function removeImage(id: string) {
		// 最後の1枚は削除不可
		if (images.length === 1) {
			alert("最低1枚の画像が必要です");
			return;
		}

		setDeleteConfirm(id);
	}

	function confirmDelete() {
		if (!deleteConfirm) return;

		const newImages = images.filter((img) => img.id !== deleteConfirm);
		const reordered = newImages.map((img, index) => ({
			...img,
			order: index,
		}));
		setImages(reordered);
		setDeleteConfirm(null);
	}

	function cancelDelete() {
		setDeleteConfirm(null);
	}

	// 全画像を順序通りに、既存/新規の情報を含めて送信
	// フォーマット: "existing:contentId" または "new:resourceId"
	const imageItems = images
		.map((img) => {
			if (img.isExisting && img.contentId) {
				return `existing:${img.contentId}`;
			}
			if (!img.isExisting && img.resourceId) {
				return `new:${img.resourceId}`;
			}
			return null;
		})
		.filter((item): item is string => item !== null);

	return (
		<>
			<div className="font-medium text-sm">画像管理</div>

			{/* 削除確認ダイアログ */}
			{deleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="rounded-lg bg-white p-6 shadow-xl">
						<h3 className="mb-4 font-bold text-lg">画像の削除</h3>
						<p className="mb-6 text-gray-700">
							この画像を削除してもよろしいですか？
						</p>
						<div className="flex justify-end gap-4">
							<NeutralButton type="button" onClick={cancelDelete}>
								キャンセル
							</NeutralButton>
							<NegativeButton type="button" onClick={confirmDelete}>
								削除
							</NegativeButton>
						</div>
					</div>
				</div>
			)}

			<div className="space-y-4">
				{/* 画像一覧 */}
				{images.length > 0 && (
					<div className="space-y-2">
						{images.map((image, index) => (
							<div
								key={image.id}
								className="flex items-center gap-4 rounded-lg border p-4"
							>
								<img
									src={image.url}
									alt={image.name}
									className="h-24 w-24 rounded object-cover"
								/>
								<div className="flex-1">
									<p className="text-sm">{image.name}</p>
									<p className="text-gray-500 text-xs">
										順序: {index + 1}
										{index === 0 && " (サムネイル)"}
										{image.isExisting ? " [既存]" : " [新規]"}
									</p>
								</div>
								<div className="flex gap-2">
									<NeutralButton
										type="button"
										onClick={() => moveUp(index)}
										disabled={index === 0}
										title="上へ移動"
									>
										↑
									</NeutralButton>
									<NeutralButton
										type="button"
										onClick={() => moveDown(index)}
										disabled={index === images.length - 1}
										title="下へ移動"
									>
										↓
									</NeutralButton>
									<NegativeButton
										type="button"
										onClick={() => removeImage(image.id)}
										disabled={images.length === 1}
										title={
											images.length === 1 ? "最後の1枚は削除できません" : "削除"
										}
									>
										✕
									</NegativeButton>
								</div>
							</div>
						))}
					</div>
				)}

				{/* 画像追加ボタン */}
				<NeutralButton type="button" onClick={addImages}>
					+ 新しい画像を追加
				</NeutralButton>
			</div>

			{/* 全画像の順序情報（既存/新規を区別） */}
			{imageItems.map((item) => (
				<input key={item} type="hidden" name="imageItems" value={item} />
			))}
		</>
	);
}
