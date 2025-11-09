import { useState } from "react";
import { NeutralButton } from "../../../shared/ui/components/button.component.js";

export function useAuthorUrls(initialUrls?: Record<string, string>) {
	const [urls, setUrls] = useState<Record<string, string>>(initialUrls || {});

	function add(name: string, url: string) {
		setUrls((prev) => ({
			...prev,
			[name]: url,
		}));
	}

	function remove(name: string) {
		setUrls((prev) => {
			const newUrls = { ...prev };
			delete newUrls[name];
			return newUrls;
		});
	}

	return { urls, add, remove, setUrls };
}

export function AuthorUrlsInput({
	urls,
	onAddClick,
	onRemoveClick,
}: {
	urls: Record<string, string>;
	onAddClick: () => void;
	onRemoveClick: (name: string) => void;
}) {
	return (
		<div className="space-y-2">
			<div>
				<label htmlFor="urls" className="font-medium text-sm">
					URL
				</label>
				<NeutralButton type="button" onClick={onAddClick}>
					追加
				</NeutralButton>
			</div>
			<input type="hidden" name="urls" value={JSON.stringify(urls)} />
			{Object.keys(urls).length > 0 ? (
				<table className="min-w-full border-collapse border border-gray-300">
					<thead>
						<tr className="bg-gray-100">
							<th className="border border-gray-300 px-4 py-2 text-left">
								サービス名
							</th>
							<th className="border border-gray-300 px-4 py-2 text-left">
								URL
							</th>
							<th className="w-24 border border-gray-300 px-4 py-2 text-center">
								操作
							</th>
						</tr>
					</thead>
					<tbody>
						{Object.entries(urls).map(([service, url]) => (
							<tr key={service} className="hover:bg-gray-50">
								<td className="border border-gray-300 px-4 py-2">{service}</td>
								<td className="border border-gray-300 px-4 py-2">
									<a
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:underline"
									>
										{url}
									</a>
								</td>
								<td className="border border-gray-300 px-4 py-2 text-center">
									<button
										type="button"
										onClick={() => onRemoveClick(service)}
										className="font-medium text-red-600 hover:text-red-800"
									>
										削除
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			) : (
				<p className="text-gray-500 text-sm">URLが登録されていません</p>
			)}
		</div>
	);
}
