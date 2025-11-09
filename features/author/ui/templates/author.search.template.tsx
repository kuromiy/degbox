import { PositiveButton } from "../../../shared/ui/components/button.component.js";
import { Pagination } from "../../../shared/ui/components/pagination.component.js";
import { useNavigation } from "../../../shared/ui/navigation.context.js";
import type { AuthorWithVideoCount } from "../../author.model.js";
import AuthorCard from "../components/author.card.js";

export function AuthorSearchTemplate({
	data,
}: {
	data: {
		count: number;
		result: AuthorWithVideoCount[];
		page: number;
		size: number;
		name?: string | undefined;
	};
}) {
	const { Form } = useNavigation();

	return (
		<main className="container mx-auto pt-10 px-2 flex flex-col justify-center">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-800">作者検索</h1>
			</div>

			<Form className="mb-8 flex items-center gap-4">
				<input
					type="text"
					name="name"
					placeholder="作者名を入力..."
					className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
				<PositiveButton type="submit">検索</PositiveButton>
				<select
					name="size"
					className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
				>
					<option value="10">10件</option>
					<option value="20">20件</option>
					<option value="30">30件</option>
				</select>
			</Form>

			<div className="mb-4 text-gray-600">
				{data.count}件の作者が見つかりました
			</div>

			{data.result.length === 0 ? (
				<div className="text-center text-gray-500 py-10">
					該当する作者が見つかりませんでした
				</div>
			) : (
				<>
					<Pagination
						currentPage={data.page}
						totalPages={Math.ceil(data.count / data.size)}
						baseUrl="/author/search"
						queryParams={{
							...(data.name && { name: data.name }),
							size: data.size,
						}}
					/>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{data.result.map((author) => (
							<AuthorCard key={author.id} author={author} />
						))}
					</div>
					<Pagination
						currentPage={data.page}
						totalPages={Math.ceil(data.count / data.size)}
						baseUrl="/author/search"
						queryParams={{
							...(data.name && { name: data.name }),
							size: data.size,
						}}
					/>
				</>
			)}
		</main>
	);
}
