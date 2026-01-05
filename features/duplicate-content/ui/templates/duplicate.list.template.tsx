import { PositiveButton } from "../../../shared/ui/components/button.component.js";
import type { DuplicateGroup } from "../../duplicate.content.model.js";
import { DuplicateGroupCard } from "../components/duplicate.group.card.component.js";

interface DuplicateListTemplateProps<T extends DuplicateGroup> {
	groups: T[];
	getThumbnailUrl: (group: T) => string | undefined;
	onGroupClick: (groupId: string) => void;
	queueCount?: number;
	threshold?: number;
	isScanning?: boolean;
	onRunScan?: () => void;
}

export function DuplicateListTemplate<T extends DuplicateGroup>({
	groups,
	getThumbnailUrl,
	onGroupClick,
	queueCount = 0,
	threshold = 10,
	isScanning = false,
	onRunScan,
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

			{/* スキャン待ちキュー情報・スキャンボタン */}
			<div className="mb-6 flex items-center gap-4 rounded-lg bg-gray-50 p-4">
				<div className="flex-1">
					<p className="font-medium text-gray-700 text-sm">
						類似スキャン待ち: {queueCount}件 / {threshold}件で自動実行
					</p>
					{queueCount > 0 && (
						<div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
							<div
								className="h-full bg-blue-500 transition-all duration-300"
								style={{
									width: `${Math.min((queueCount / threshold) * 100, 100)}%`,
								}}
							/>
						</div>
					)}
				</div>
				{onRunScan && (
					<PositiveButton
						onClick={onRunScan}
						disabled={isScanning || queueCount === 0}
					>
						{isScanning ? "スキャン中..." : "類似スキャン実行"}
					</PositiveButton>
				)}
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
