import { isFailure } from "electron-flow/result";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import {
	NeutralButton,
	PositiveButton,
} from "../../../features/shared/ui/components/button.component.js";
import { ApiService } from "../autogenerate/register.js";

const client = new ApiService();

export async function loader() {
	const response = await client.getRecentProject();
	if (isFailure(response)) {
		throw response.value;
	}
	return response.value;
}

export default function ProjectSelectPage() {
	const data = useLoaderData<typeof loader>();
	const [error, setError] = useState<string | null>(null);

	async function registerProject() {
		setError(null);
		try {
			const response = await client.registerProject();
			if (isFailure(response)) {
				console.error("Failed to register project:", response.value);
				setError("プロジェクトの作成に失敗しました。");
				return false;
			}
			return true;
		} catch (err) {
			console.error("Unexpected error during project registration:", err);
			setError(
				err instanceof Error
					? err.message
					: "プロジェクトの作成中に予期しないエラーが発生しました。",
			);
			return false;
		}
	}

	async function selectProject() {
		setError(null);
		try {
			const response = await client.selectProject();
			if (isFailure(response)) {
				console.error("Failed to select project:", response.value);
				setError("プロジェクトの選択に失敗しました。");
				return false;
			}
			return true;
		} catch (err) {
			console.error("Unexpected error during project selection:", err);
			setError(
				err instanceof Error
					? err.message
					: "プロジェクトの選択中に予期しないエラーが発生しました。",
			);
			return false;
		}
	}

	async function handleOpenProject(projectId: string) {
		setError(null);
		try {
			const response = await client.openProject(projectId);
			if (isFailure(response)) {
				console.error("Failed to open project:", response.value);
				setError("プロジェクトを開けませんでした。");
				return false;
			}
			return true;
		} catch (err) {
			console.error("Unexpected error during project open:", err);
			setError(
				err instanceof Error
					? err.message
					: "プロジェクトを開く際に予期しないエラーが発生しました。",
			);
			return false;
		}
	}

	return (
		<main className="container mx-auto flex flex-col justify-center px-2 pt-10">
			<h1 className="mb-6 font-bold text-2xl">プロジェクト選択</h1>

			{error && (
				<div
					role="alert"
					className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
				>
					<p>{error}</p>
					<button
						type="button"
						className="mt-2 text-red-500 text-sm underline hover:text-red-700"
						onClick={() => setError(null)}
					>
						閉じる
					</button>
				</div>
			)}

			{data.length === 0 ? (
				<p className="text-gray-500">最近開いたプロジェクトはありません</p>
			) : (
				<ul className="space-y-3">
					{data.map((project) => (
						<li key={project.id}>
							<button
								type="button"
								className="w-full cursor-pointer rounded-lg border p-4 text-left transition-colors hover:bg-gray-50"
								onClick={() => handleOpenProject(project.id)}
							>
								<div className="flex items-center justify-between">
									<div>
										<h2 className="font-semibold text-lg">{project.name}</h2>
										{project.overview && (
											<p className="mt-1 text-gray-600 text-sm">
												{project.overview}
											</p>
										)}
									</div>
									<span className="text-gray-400 text-sm">
										{new Date(project.openedAt).toLocaleDateString("ja-JP")}
									</span>
								</div>
							</button>
						</li>
					))}
				</ul>
			)}
			<div className="flex gap-4">
				<PositiveButton onClick={registerProject}>
					新規プロジェクト作成
				</PositiveButton>
				<NeutralButton onClick={selectProject}>
					既存プロジェクトを開く
				</NeutralButton>
			</div>
		</main>
	);
}
