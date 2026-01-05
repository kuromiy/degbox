import { useCallback, useState } from "react";
import { ApiService } from "../autogenerate/register.js";
import { RecordTable } from "./record-table.component.js";
import { TableList } from "./table-list.component.js";

const client = new ApiService();

export function DbViewerApp() {
	const [selectedTable, setSelectedTable] = useState<string | null>(null);

	const handleTableSelect = useCallback((tableName: string) => {
		setSelectedTable(tableName);
	}, []);

	return (
		<div className="flex h-screen bg-gray-100">
			<TableList
				client={client}
				selectedTable={selectedTable}
				onTableSelect={handleTableSelect}
			/>
			<div className="flex-1 overflow-hidden">
				{selectedTable ? (
					<RecordTable client={client} tableName={selectedTable} />
				) : (
					<div className="flex h-full items-center justify-center text-gray-500">
						テーブルを選択してください
					</div>
				)}
			</div>
		</div>
	);
}
