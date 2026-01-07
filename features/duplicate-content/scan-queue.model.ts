export type ScanQueueItem = {
	id: string;
	contentHashId: string;
	createdAt: string;
};

export type ContentHashWithQueue = {
	queueId: string;
	contentHashId: string;
	contentId: string;
	hashValue: string;
};
