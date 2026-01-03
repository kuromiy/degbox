import { sql } from "drizzle-orm";
import {
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import type { ContentType } from "../../../content/content.type.js";

// 共通のカラム?
// createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
// updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),

// 動画
export const VIDEOS = sqliteTable("videos", {
	id: text("id").primaryKey(),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// タグ
export const TAGS = sqliteTable("tags", {
	id: text("id").primaryKey(),
	name: text("name").unique().notNull(),
});

// 作者
export const AUTHORS = sqliteTable("authors", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	urls: text("urls", { mode: "json" })
		.$type<Record<string, string>>()
		.notNull(),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// コンテンツ
export const CONTENTS = sqliteTable("contents", {
	id: text("id").primaryKey(),
	path: text("path").notNull(),
	name: text("name").notNull(),
	type: text("type").$type<ContentType>().notNull(),
});

// コンテンツハッシュ
export const CONTENT_HASHS = sqliteTable("content_hashs", {
	id: text("id").primaryKey(),
	contentId: text("content_id")
		.notNull()
		.references(() => CONTENTS.id, { onDelete: "cascade" }), // 紐づいたコンテンツが削除されたら一緒に削除される。
	type: text("type").notNull(),
	value: text("value").notNull(),
	metadata: text("metadata", { mode: "json" }), // .$type<HashMetadata>()
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 重複コンテンツ
export const DUPLICATE_GROUPS = sqliteTable("duplicate_groups", {
	id: text("id").primaryKey(),
	hashType: text("hash_type").notNull(),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const DUPLICATE_GROUP_ITEMS = sqliteTable(
	"duplicate_group_items",
	{
		groupId: text("group_id")
			.notNull()
			.references(() => DUPLICATE_GROUPS.id, { onDelete: "cascade" }),
		contentId: text("content_id")
			.notNull()
			.references(() => CONTENTS.id, { onDelete: "cascade" }),
		similarity: integer("similarity"),
	},
	(table) => [primaryKey({ columns: [table.groupId, table.contentId] })],
);

// 中間テーブル
export const VIDEOS_TAGS = sqliteTable(
	"videos_tags",
	{
		videoId: text("video_id")
			.notNull()
			.references(() => VIDEOS.id),
		tagId: text("tag_id")
			.notNull()
			.references(() => TAGS.id),
	},
	(table) => [primaryKey({ columns: [table.videoId, table.tagId] })],
);

export const VIDEOS_AUTHORS = sqliteTable(
	"videos_authors",
	{
		videoId: text("video_id")
			.notNull()
			.references(() => VIDEOS.id),
		authorId: text("author_id")
			.notNull()
			.references(() => AUTHORS.id),
	},
	(table) => [primaryKey({ columns: [table.videoId, table.authorId] })],
);

export const VIDEOS_CONTENTS = sqliteTable(
	"videos_contents",
	{
		videoId: text("video_id")
			.notNull()
			.references(() => VIDEOS.id),
		contentId: text("content_id")
			.notNull()
			.references(() => CONTENTS.id),
		order: integer("order").notNull().default(0),
	},
	(table) => [primaryKey({ columns: [table.videoId, table.contentId] })],
);

// タグ共起行列
export const TAG_COOCCURRENCES = sqliteTable(
	"tag_cooccurrences",
	{
		tag1Id: text("tag1_id")
			.notNull()
			.references(() => TAGS.id, { onDelete: "cascade" }),
		tag2Id: text("tag2_id")
			.notNull()
			.references(() => TAGS.id, { onDelete: "cascade" }),
		count: integer("count").notNull().default(0),
	},
	(table) => [primaryKey({ columns: [table.tag1Id, table.tag2Id] })],
);

// イラスト
export const ILLUSTS = sqliteTable("illusts", {
	id: text("id").primaryKey(),
	createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// イラストとコンテンツの中間テーブル（並び順付き）
export const ILLUSTS_CONTENTS = sqliteTable(
	"illusts_contents",
	{
		illustId: text("illust_id")
			.notNull()
			.references(() => ILLUSTS.id),
		contentId: text("content_id")
			.notNull()
			.references(() => CONTENTS.id),
		order: integer("order").notNull(),
	},
	(table) => [primaryKey({ columns: [table.illustId, table.contentId] })],
);

// イラストとタグの中間テーブル
export const ILLUSTS_TAGS = sqliteTable(
	"illusts_tags",
	{
		illustId: text("illust_id")
			.notNull()
			.references(() => ILLUSTS.id),
		tagId: text("tag_id")
			.notNull()
			.references(() => TAGS.id),
	},
	(table) => [primaryKey({ columns: [table.illustId, table.tagId] })],
);

// イラストと作者の中間テーブル
export const ILLUSTS_AUTHORS = sqliteTable(
	"illusts_authors",
	{
		illustId: text("illust_id")
			.notNull()
			.references(() => ILLUSTS.id),
		authorId: text("author_id")
			.notNull()
			.references(() => AUTHORS.id),
	},
	(table) => [primaryKey({ columns: [table.illustId, table.authorId] })],
);
