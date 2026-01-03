export type DuplicateGroup = {
	id: string;
	hashType: string;
	items: DuplicateGroupItem[];
};

export type DuplicateGroupItem = {
	// groupId: string; DuplicateGroup参照
	contentId: string;
	similarity: number;
};
