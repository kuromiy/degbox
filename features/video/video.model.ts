import type { Author } from "../author/author.model.js";
import type { Content } from "../content/content.model.js";
import type { Tag } from "../tag/tag.model.js";

export type Video = {
	id: string;
	contents: Content[];
	tags: Tag[];
	authors: Author[];
};
