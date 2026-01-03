import type { Content } from "../../content/content.model.js";
import type { ContentHash } from "../content.hash.model.js";

export interface HashCalculator {
	calculate(content: Content): Promise<ContentHash[]>;
}
