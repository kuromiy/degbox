import { isFailure, isSuccess } from "electron-flow/result";
import { useCallback, useState } from "react";
import { useLoaderData, useNavigate, useRevalidator } from "react-router-dom";
import type { DuplicateGroup } from "../../../features/duplicate-content/duplicate.content.model.js";
import { DuplicateListTemplate } from "../../../features/duplicate-content/ui/templates/duplicate.list.template.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

// APIレスポンスの型（thumbnailPath付き）
type DuplicateGroupWithThumbnail = DuplicateGroup & {
	thumbnailPath?: string | undefined;
};

type LoaderData = {
	groups: DuplicateGroupWithThumbnail[];
	queueCount: number;
	threshold: number;
};

export async function loader(): Promise<LoaderData> {
	const [groupsResponse, queueResponse] = await Promise.all([
		client.listDuplicateGroups(),
		client.getQueueCount(),
	]);

	if (isFailure(groupsResponse)) {
		throw new Error(
			typeof groupsResponse.value === "string"
				? groupsResponse.value
				: JSON.stringify(groupsResponse.value),
		);
	}

	const queueData = isSuccess(queueResponse)
		? queueResponse.value
		: { count: 0, threshold: 10 };

	return {
		groups: groupsResponse.value.groups,
		queueCount: queueData.count,
		threshold: queueData.threshold,
	};
}

export default function DuplicateListPage() {
	const data = useLoaderData<LoaderData>();
	const navigate = useNavigate();
	const revalidator = useRevalidator();
	const [isScanning, setIsScanning] = useState(false);

	// サムネイルURL取得（APIから取得したthumbnailPathを使用）
	const getThumbnailUrl = (
		group: DuplicateGroupWithThumbnail,
	): string | undefined => {
		return group.thumbnailPath;
	};

	const handleGroupClick = useCallback(
		(groupId: string) => {
			navigate(`/duplicate/${groupId}`);
		},
		[navigate],
	);

	const handleRunScan = useCallback(async () => {
		setIsScanning(true);
		try {
			const response = await client.runSimilarityScan();
			if (isSuccess(response)) {
				// スキャン完了後にデータを再取得
				revalidator.revalidate();
			}
		} finally {
			setIsScanning(false);
		}
	}, [revalidator]);

	return (
		<DuplicateListTemplate
			groups={data.groups}
			getThumbnailUrl={getThumbnailUrl}
			onGroupClick={handleGroupClick}
			queueCount={data.queueCount}
			threshold={data.threshold}
			isScanning={isScanning}
			onRunScan={handleRunScan}
		/>
	);
}
