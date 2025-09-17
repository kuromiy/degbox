export interface FileSystemOperationCommand {
	execute(): Promise<void>;
	undo(): Promise<void>;
	done(): Promise<void>; // トランザクション/ロールバックを実装するために発生した不整合を解消するためのメソッド
}
