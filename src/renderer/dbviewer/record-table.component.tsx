import { isFailure } from "electron-flow/result";
import { useEffect, useState } from "react";
import type { ServiceIF } from "../autogenerate/register.js";

type ColumnInfo = {
	cid: number;
	name: string;
	type: string;
	notnull: number;
	dflt_value: string | null;
	pk: number;
};

type Props = {
	client: ServiceIF;
	tableName: string;
};

export function RecordTable({ client, tableName }: Props) {
	const [columns, setColumns] = useState<ColumnInfo[]>([]);
	const [records, setRecords] = useState<Record<string, unknown>[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [total, setTotal] = useState(0);
	const [reloadKey, setReloadKey] = useState(0);
	const limit = 50;

	const [prevTableName, setPrevTableName] = useState(tableName);
	const currentPage = prevTableName !== tableName ? 1 : page;

	if (prevTableName !== tableName) {
		setPrevTableName(tableName);
		setPage(1);
	}

	useEffect(() => {
		const fetchRecords = async () => {
			setLoading(true);
			setError(null);
			try {
				const result = await client.devRecords(tableName, currentPage, limit);
				if (isFailure(result)) {
					setError("レコードの取得に失敗しました");
				} else {
					setColumns(result.value.columns);
					setRecords(result.value.records);
					setTotalPages(result.value.totalPages);
					setTotal(result.value.total);
				}
			} catch {
				setError("レコードの取得に失敗しました");
			} finally {
				setLoading(false);
			}
		};

		// reloadKeyの変更でデータを再取得
		void reloadKey;
		fetchRecords();
	}, [client, tableName, currentPage, reloadKey]);

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center">
				読み込み中...
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-full items-center justify-center text-red-500">
				{error}
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col bg-white">
			<div className="flex items-center justify-between border-gray-300 border-b bg-gray-50 p-3">
				<div className="font-semibold">
					{tableName}
					<span className="ml-2 font-normal text-gray-500">({total} 件)</span>
				</div>
				<button
					type="button"
					onClick={() => setReloadKey((k) => k + 1)}
					className="rounded border border-gray-300 bg-white px-3 py-1 hover:bg-gray-100"
				>
					再読み込み
				</button>
			</div>
			<div className="flex-1 overflow-auto">
				<table className="w-full border-collapse text-sm">
					<thead className="sticky top-0 bg-gray-100">
						<tr>
							{columns.map((col) => (
								<th
									key={col.name}
									className="whitespace-nowrap border border-gray-300 px-3 py-2 text-left font-medium"
								>
									{col.name}
									<span className="ml-1 text-gray-400 text-xs">
										({col.type})
									</span>
									{col.pk === 1 && (
										<span className="ml-1 text-blue-500 text-xs">PK</span>
									)}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{records.map((record, idx) => {
							const pkColumns = columns.filter((col) => col.pk > 0);
							const recordKey =
								pkColumns.length > 0
									? pkColumns.map((col) => String(record[col.name])).join("-")
									: `row-${page}-${idx}`;
							return (
								<tr key={recordKey} className="hover:bg-gray-50">
									{columns.map((col) => (
										<td
											key={col.name}
											className="max-w-xs truncate border border-gray-200 px-3 py-2"
											title={String(record[col.name] ?? "")}
										>
											{formatValue(record[col.name])}
										</td>
									))}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2 border-gray-300 border-t bg-gray-50 p-3">
					<button
						type="button"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
						className="rounded border border-gray-300 bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
					>
						前へ
					</button>
					<span>
						{page} / {totalPages}
					</span>
					<button
						type="button"
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						disabled={page === totalPages}
						className="rounded border border-gray-300 bg-white px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
					>
						次へ
					</button>
				</div>
			)}
		</div>
	);
}

function formatValue(value: unknown): string {
	if (value === null) {
		return "NULL";
	}
	if (value === undefined) {
		return "";
	}
	if (typeof value === "object") {
		return JSON.stringify(value);
	}
	return String(value);
}
