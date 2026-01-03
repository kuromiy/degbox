import type { DuplicateGroup } from "../../duplicate.content.model.js";
import { DuplicateGroupCard } from "../components/duplicate.group.card.component.js";

interface DuplicateListTemplateProps<T extends DuplicateGroup> {
	groups: T[];
	getThumbnailUrl: (group: T) => string | undefined;
	onGroupClick: (groupId: string) => void;
}

export function DuplicateListTemplate<T extends DuplicateGroup>({
	groups,
	getThumbnailUrl,
	onGroupClick,
}: DuplicateListTemplateProps<T>) {
	return (
		<main className="container mx-auto flex flex-col justify-center px-2 pt-10">
			{/* ヘッダー */}
			<div className="mb-8">
				<h1 className="mb-2 font-bold text-2xl text-gray-800">
					重複コンテンツ管理
				</h1>
				<p className="text-gray-600">
					同一または類似のコンテンツグループを表示しています
				</p>
			</div>

			{/* 検索結果情報 */}
			<div className="mb-4 text-gray-600 text-sm">全{groups.length}件</div>

			{/* グループグリッド */}
			<div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
				{groups.map((group) => (
					<DuplicateGroupCard
						key={group.id}
						group={group}
						thumbnailUrl={getThumbnailUrl(group)}
						onClick={() => onGroupClick(group.id)}
					/>
				))}
			</div>

			{/* 結果が空の場合 */}
			{groups.length === 0 && (
				<div className="py-20 text-center text-gray-500">
					重複コンテンツは見つかりませんでした
				</div>
			)}
		</main>
	);
}
