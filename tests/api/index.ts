import { glob } from "node:fs";
import { run } from "node:test";
import { spec } from "node:test/reporters";

const files = await getFiles();

run({
	files,
})
	.on("test:fail", () => {
		process.exitCode = 1;
	})
	.compose(spec)
	.pipe(process.stdout);

function getFiles() {
	return new Promise<string[]>((resolve, reject) => {
		glob("./tests/api/*.test.{ts,tsx}", (err, matches) => {
			if (err) {
				return reject(err);
			}
			return resolve(matches);
		});
	});
}
