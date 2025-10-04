export interface ContentService {
	calcHash(path: string): Promise<string>;
	moveToDestination(sourcePath: string, contentId: string): Promise<string>;
}
