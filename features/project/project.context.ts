import type { Project, ProjectPath } from "./project.model.js";

/**
 * 現在開いているプロジェクトのコンテキストを管理する
 */
export class ProjectContext {
	private current: Project | null = null;

	/**
	 * プロジェクトを開く
	 */
	open(project: Project): void {
		this.current = project;
	}

	/**
	 * プロジェクトを閉じる
	 */
	close(): void {
		this.current = null;
	}

	/**
	 * 現在のプロジェクトパスを取得
	 * @throws プロジェクトが開かれていない場合
	 */
	getPath(): ProjectPath {
		if (!this.current) {
			throw new Error("No project opened");
		}
		return this.current.path;
	}

	/**
	 * 現在のプロジェクトを取得
	 * @throws プロジェクトが開かれていない場合
	 */
	getProject(): Project {
		if (!this.current) {
			throw new Error("No project opened");
		}
		return this.current;
	}

	/**
	 * プロジェクトが開かれているかどうか
	 */
	isOpened(): boolean {
		return this.current !== null;
	}
}
