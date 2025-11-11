import { glob } from "node:fs";
import { run } from "node:test";
import { spec } from "node:test/reporters";

// コマンドライン引数から機能名を取得
const featureName = process.argv[2];

const files = await getFiles(featureName);

run({
	files,
})
	.on("test:fail", () => {
		process.exitCode = 1;
	})
	.compose(spec)
	.pipe(process.stdout);

function getFiles(feature?: string) {
	// 機能名が指定された場合は、そのフォルダ配下のみ検索
	// 指定されない場合は、すべてのテストを検索
	const pattern = feature
		? `./tests/server/${feature}/**/*.test.{ts,tsx}`
		: "./tests/server/**/*.test.{ts,tsx}";

	return new Promise<string[]>((resolve, reject) => {
		glob(pattern, (err, matches) => {
			if (err) {
				return reject(err);
			}
			return resolve(matches);
		});
	});
}
