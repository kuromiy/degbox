import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { stream } from "hono/streaming";
import { TOKENS } from "../../../main/depend.injection.js";
import { factory } from "../../factory.js";

const app = factory.createApp();

async function isExistFile(path: string) {
	try {
		await access(path);
		return true;
	} catch (_err) {
		return false;
	}
}

app.get("/*", async (c) => {
	const { container } = c.var;
	const logger = container.get(TOKENS.LOGGER);
	const path = c.req.path.replace(/^\/file\//, "");
	const exist = await isExistFile(path);
	logger.info(`path ${path} exist : ${exist}`);
	if (!exist) {
		return c.notFound();
	}

	return stream(c, async (stream) => {
		stream.onAbort(() => {
			console.log("Aborted.");
		});
		const fileStream = createReadStream(path);
		for await (const chunk of fileStream) {
			await stream.write(chunk);
		}
	});
});

export default app;
