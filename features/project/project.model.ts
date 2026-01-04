import { isAbsolute } from "node:path";
import type { Branded } from "../shared/path/types.js";

/** プロジェクトの絶対パス */
export type ProjectPath = Branded<string, "ProjectPath">;

/**
 * 文字列をProjectPath型に変換
 * @throws 絶対パスでない場合
 */
export function toProjectPath(path: string): ProjectPath {
	if (!isAbsolute(path)) {
		throw new Error(`ProjectPath must be absolute: ${path}`);
	}
	return path as ProjectPath;
}

export type Project = {
	id: string;
	name: string;
	path: ProjectPath;
	overview: string;
	openedAt: string;
	createdAt: string;
};
