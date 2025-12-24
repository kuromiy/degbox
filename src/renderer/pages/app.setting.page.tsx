import { isFailure } from "electron-flow/result";
import {
	type ActionFunctionArgs,
	redirect,
	useLoaderData,
} from "react-router-dom";
import {
	NeutralButton,
	PositiveButton,
} from "../../../features/shared/ui/components/button.component.js";
import { Input } from "../../../features/shared/ui/components/input.component.js";
import { useNavigation } from "../../../features/shared/ui/navigation.context.js";
import { ApiService } from "../autogenerate/register.js";

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

	console.log(`ffmpeg: ${ffmpegPath}`);
	if (!ffmpegPath) {
		console.log("必須項目が入力されていません");
		throw new Error("必須項目が入力されていません");
	}

	const response = await client.updateAppSetting(ffmpegPath);
	if (isFailure(response)) {
		console.log(`response error: ${response.value.message}`);
		throw new Error(response.value.message);
	}

	return redirect("/appsettings");
}

export default function AppSettingPage() {
	const data = useLoaderData<typeof loader>();
	const { Form } = useNavigation();

	return (
		<main className="container mx-auto flex flex-col justify-center px-2 pt-10">
			<h1>設定画面</h1>
			<Form className="flex flex-col gap-4" method="POST">
				<h1>FFMPEG パス</h1>
				<Input name="ffmpegPath" type="text" defaultValue={data.ffmpeg} />
				<div className="flex gap-4">
					<NeutralButton type="reset">クリア</NeutralButton>
					<PositiveButton type="submit">更新</PositiveButton>
				</div>
			</Form>
		</main>
	);
}
