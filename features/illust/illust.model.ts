import type { Author } from "../author/author.model.js";
import type { Content } from "../content/content.model.js";
import type { Tag } from "../tag/tag.model.js";

export type IllustContent = {
	content: Content;
	order: number;
};

export type Illust = {
	id: string;
	contents: IllustContent[];
	tags: Tag[];
	authors: Author[];
};
