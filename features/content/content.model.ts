import type { ContentType } from "./content.type.js";

export type Content = {
	id: string;
	path: string;
	name: string;
	type: ContentType;
	// hash: string;
	// createdAt: Date;
	// updatedAt: Date;
};
