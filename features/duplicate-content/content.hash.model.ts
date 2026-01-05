export type HashMetadata = {
	source?: "scene";
	timestamp?: number;
};

export type ContentHash = {
	id: string;
	contentId: string;
	type: string;
	value: string;
	metadata?: HashMetadata;
};
