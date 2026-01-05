export type SimilarityScanJobPayload = {
	contentIds?: string[]; // 指定がなければキュー全件
};

export type SimilarityScanJob = {
	type: "similarity-scan";
	payload: SimilarityScanJobPayload;
};
