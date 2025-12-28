import { isFailure } from "electron-flow/result";
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

	async function registerProject() {
		await client.registerProject();
	}

	async function selectProject() {
		await client.selectProject();
	}

	async function handleOpenProject(projectId: string) {
		await client.openProject(projectId);
	}

	return (
		<main className="container mx-auto flex flex-col justify-center px-2 pt-10">
			<h1 className="mb-6 font-bold text-2xl">プロジェクト選択</h1>

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
