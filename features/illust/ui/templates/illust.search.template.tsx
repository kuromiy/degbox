import { PositiveButton } from "../../../shared/ui/components/button.component.js";
import { Input } from "../../../shared/ui/components/input.component.js";
import { Pagination } from "../../../shared/ui/components/pagination.component.js";
import { useNavigation } from "../../../shared/ui/navigation.context.js";
import type { Illust } from "../../illust.model.js";
import IllustCard from "../components/illust.card.component.js";

export function IllustSearchTemplate({
	data,
	urlPrefix,
}: {
	data: {
		items: Illust[];
		total: number;
		page: number;
		limit: number;
		hasNext: boolean;
		hasPrev: boolean;
		keyword?: string | undefined;
		sortBy?: string;
		order?: string;
	};
	urlPrefix: string;
}) {
	const { Form } = useNavigation();

	return (
		<main className="container mx-auto flex flex-col justify-center px-2 pt-10">
			{/* 検索フォーム */}
			<Form className="mb-8 flex items-center gap-4">
				<Input
					type="text"
					name="keyword"
					placeholder="キーワードを入力..."
					defaultValue={data.keyword}
					className="flex-1"
				/>
				<select
					name="order"
					defaultValue={data.order || "desc"}
					className="rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="desc">ID降順（新しい順）</option>
					<option value="asc">ID昇順（古い順）</option>
				</select>
				<select
					name="limit"
					defaultValue={data.limit}
					className="rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="10">10件</option>
					<option value="20">20件</option>
					<option value="30">30件</option>
				</select>
				<PositiveButton type="submit">検索</PositiveButton>
			</Form>

			{/* 検索結果情報 */}
			<div className="mb-4 text-gray-600 text-sm">
				全{data.total}件{data.keyword && ` - タグ: "${data.keyword}"`}
			</div>

			{/* ページネーション（上） */}
			<Pagination
				currentPage={data.page}
				totalPages={Math.ceil(data.total / data.limit)}
				baseUrl="/illust/search"
				queryParams={{
					...(data.keyword && { keyword: data.keyword }),
					...(data.sortBy && { sortBy: data.sortBy }),
					...(data.order && { order: data.order }),
					limit: data.limit,
				}}
			/>

			{/* イラストグリッド */}
			<div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
				{data.items.map((illust) => (
					<IllustCard
						key={illust.id}
						illust={illust}
						to={`${urlPrefix}/${illust.id}`}
					/>
				))}
			</div>

			{/* 検索結果が空の場合 */}
			{data.items.length === 0 && (
				<div className="py-20 text-center text-gray-500">
					該当するイラストが見つかりませんでした
				</div>
			)}

			{/* ページネーション（下） */}
			<Pagination
				currentPage={data.page}
				totalPages={Math.ceil(data.total / data.limit)}
				baseUrl="/illust/search"
				queryParams={{
					...(data.keyword && { keyword: data.keyword }),
					...(data.sortBy && { sortBy: data.sortBy }),
					...(data.order && { order: data.order }),
					limit: data.limit,
				}}
			/>
		</main>
	);
}
