import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { PROJECTS } from "../shared/database/user/schema.js";
import type { Database } from "../shared/database/user/type.js";
import { type Project, toProjectPath } from "./project.model.js";
import type { ProjectRepository } from "./project.repository.js";

export class ProjectDataSource implements ProjectRepository {
	constructor(private readonly db: Database) {}

	async generateId(): Promise<string> {
		return randomUUID();
	}

	async save(project: Project): Promise<Project> {
		await this.db
			.insert(PROJECTS)
			.values({
				id: project.id,
				name: project.name,
				path: project.path,
				overview: project.overview,
				openedAt: project.openedAt,
				createdAt: project.createdAt,
			})
			.onConflictDoUpdate({
				target: PROJECTS.id,
				set: {
					name: project.name,
					path: project.path,
					overview: project.overview,
					openedAt: project.openedAt,
				},
			});

		return project;
	}

	async findById(projectId: string): Promise<Project | null> {
		const result = await this.db
			.select()
			.from(PROJECTS)
			.where(eq(PROJECTS.id, projectId))
			.limit(1);

		if (result.length === 0) {
			return null;
		}

		const row = result[0];
		if (!row) {
			return null;
		}

		return {
			id: row.id,
			name: row.name,
			path: toProjectPath(row.path),
			overview: row.overview,
			openedAt: row.openedAt,
			createdAt: row.createdAt,
		};
	}

	async delete(projectId: string): Promise<boolean> {
		const result = await this.db
			.delete(PROJECTS)
			.where(eq(PROJECTS.id, projectId));

		return result.rowsAffected > 0;
	}
}
