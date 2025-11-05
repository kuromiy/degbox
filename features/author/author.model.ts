export type Author = {
	id: string;
	name: string;
	urls: Record<string, string>;
};

export type AuthorWithVideoCount = Author & {
	videoCount: number;
};
