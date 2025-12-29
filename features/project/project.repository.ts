import type { Project } from "./project.model.js";

export interface ProjectRepository {
	generateId(): Promise<string>;
	save(project: Project): Promise<Project>;
	findById(projectId: string): Promise<Project | null>;
	delete(projectId: string): Promise<boolean>;
}
