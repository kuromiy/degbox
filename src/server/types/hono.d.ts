export * from "hono";
declare module "hono" {
	interface ContextRenderer {
		// biome-ignore lint/style/useShorthandFunctionType: module augmentation requires interface for declaration merging
		(
			children: React.ReactElement,
			props?: { title: string },
		): Response | Promise<Response>;
	}
}
