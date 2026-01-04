import type { Content } from "./content.model.js";

export interface ContentService {
	moveToDestination(sourcePath: string, contentId: string): Promise<string>;
	deleteContent(content: Content): Promise<void>;
}
