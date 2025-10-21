import { createMiddleware } from "hono/factory";
import type { Container } from "../../../features/shared/container/index.js";

export function createContainerMiddleware(container: Container) {
	return createMiddleware(async (c, next) => {
		c.set("container", container);
		await next();
	});
}
