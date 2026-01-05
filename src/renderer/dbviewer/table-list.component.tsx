import { isFailure } from "electron-flow/result";
import { useEffect, useState } from "react";
import type { ServiceIF } from "../autogenerate/register.js";

type TableInfo = {
	name: string;
};

type Props = {
	client: ServiceIF;
	selectedTable: string | null;
	onTableSelect: (tableName: string) => void;
};

export function TableList({ client, selectedTable, onTableSelect }: Props) {
	const [tables, setTables] = useState<TableInfo[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchTables = async () => {
			setLoading(true);
			setError(null);
			try {
				const result = await client.devTables();
				if (isFailure(result)) {
					setError("テーブル一覧の取得に失敗しました");
				} else {
					setTables(result.value.tables);
				}
			} catch {
				setError("テーブル一覧の取得に失敗しました");
			} finally {
				setLoading(false);
			}
		};

		fetchTables();
	}, [client]);

	if (loading) {
		return (
			<div className="flex w-60 items-center justify-center border-gray-300 border-r bg-white">
				読み込み中...
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex w-60 items-center justify-center border-gray-300 border-r bg-white text-red-500">
				{error}
			</div>
		);
	}

	return (
		<div className="flex w-60 flex-col border-gray-300 border-r bg-white">
			<div className="border-gray-300 border-b bg-gray-50 p-3 font-semibold">
				テーブル一覧
			</div>
			<div className="flex-1 overflow-y-auto">
				{tables.map((table) => (
					<button
						key={table.name}
						type="button"
						onClick={() => onTableSelect(table.name)}
						className={`w-full cursor-pointer border-gray-100 border-b px-3 py-2 text-left transition-colors hover:bg-blue-50 ${
							selectedTable === table.name
								? "bg-blue-100 font-medium text-blue-700"
								: ""
						}`}
					>
						{table.name}
					</button>
				))}
			</div>
		</div>
	);
}
