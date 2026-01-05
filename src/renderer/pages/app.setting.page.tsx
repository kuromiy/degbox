import { isFailure } from "electron-flow/result";
import { useState } from "react";
import {
	type ActionFunctionArgs,
	redirect,
	useActionData,
	useLoaderData,
} from "react-router-dom";
import {
	NeutralButton,
	PositiveButton,
} from "../../../features/shared/ui/components/button.component.js";
import { Input } from "../../../features/shared/ui/components/input.component.js";
import { useNavigation } from "../../../features/shared/ui/navigation.context.js";
import { ApiService } from "../autogenerate/register.js";
import { FieldError } from "../components/field-error.component.js";
import {
	type ActionError,
	getErrorMessage,
	isActionError,
	isErrorResponse,
} from "../utils/error.js";

const client = new ApiService();

export async function loader() {
	const response = await client.getAppSetting();
	if (isFailure(response)) {
		throw response.value;
	}
	return response.value;
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const ffmpegPath = formData.get("ffmpegPath")?.toString();
	const ffprobePath = formData.get("ffprobePath")?.toString();

	const response = await client.updateAppSetting(ffmpegPath, ffprobePath);
	if (isFailure(response)) {
		const error = response.value;
		if (isErrorResponse(error)) {
			return { error } as ActionError;
		}
		throw new Error(getErrorMessage(error));
	}

	return redirect("/appsettings");
}

export default function AppSettingPage() {
	const data = useLoaderData<typeof loader>();
	const actionData = useActionData<ActionError>();
	const { Form } = useNavigation();

	const [ffmpegPath, setFfmpegPath] = useState(data.ffmpeg ?? "");
	const [ffprobePath, setFfprobePath] = useState(data.ffprobe ?? "");

	const fieldErrors = isActionError(actionData)
		? actionData.error.type === "valid"
			? actionData.error.messages
			: undefined
		: undefined;

	const generalError =
		isActionError(actionData) && actionData.error.type !== "valid"
			? actionData.error.messages
			: undefined;

	const handleSelectBinFolder = async () => {
		const response = await client.selectFfmpegBin();
		if (isFailure(response)) {
			console.error("Failed to select bin folder:", response.value);
			return;
		}
		const result = response.value;
		if (result) {
			setFfmpegPath(result.ffmpegPath);
			setFfprobePath(result.ffprobePath);
		}
	};

	const handleClear = () => {
		setFfmpegPath("");
		setFfprobePath("");
	};

	return (
		<main className="container mx-auto flex flex-col justify-center px-2 pt-10">
			<h1>設定画面</h1>
			{generalError && (
				<div className="mb-4 rounded bg-red-100 p-3 text-red-700">
					{generalError}
				</div>
			)}
			<div className="mb-4">
				<NeutralButton type="button" onClick={handleSelectBinFolder}>
					binフォルダを選択
				</NeutralButton>
			</div>
			<Form className="flex flex-col gap-4" method="POST">
				<div>
					<h2>FFMPEG パス</h2>
					<Input
						name="ffmpegPath"
						type="text"
						value={ffmpegPath}
						onChange={(e) => setFfmpegPath(e.target.value)}
					/>
					<FieldError errors={fieldErrors?.ffmpegPath} />
				</div>
				<div>
					<h2>FFPROBE パス</h2>
					<Input
						name="ffprobePath"
						type="text"
						value={ffprobePath}
						onChange={(e) => setFfprobePath(e.target.value)}
					/>
					<FieldError errors={fieldErrors?.ffprobePath} />
				</div>
				<div className="flex gap-4">
					<NeutralButton type="button" onClick={handleClear}>
						クリア
					</NeutralButton>
					<PositiveButton type="submit">更新</PositiveButton>
				</div>
			</Form>
		</main>
	);
}
