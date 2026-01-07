import type { Context } from "../../context.js";
import { TOKENS } from "../../di/token.js";

export async function runSimilarityScan(ctx: Context) {
	const { container } = ctx;
	const [logger, duplicateContentAction] = container.get(
		TOKENS.LOGGER,
		TOKENS.DUPLICATE_CONTENT_ACTION,
	);
	logger.info("Running manual similarity scan");

	const result = await duplicateContentAction.runManualScan();

	return {
		success: true,
		processed: result.processed,
		groupsCreated: result.groupsCreated,
	};
}

export async function getQueueCount(ctx: Context) {
	const { container } = ctx;
	const duplicateContentAction = container.get(TOKENS.DUPLICATE_CONTENT_ACTION);

	const count = await duplicateContentAction.getQueueCount();

	return {
		count,
		threshold: 10, // BATCH_THRESHOLD
	};
}
