import {
  pgTable,
  serial,
  text,
  integer,
  real,
  jsonb,
  timestamp,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

const created = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updated = () => timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: created(),
});

/** Planning + screenplay documents */
export const docs = pgTable("docs", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(), // 'planning' | 'screenplay'
  folderId: integer("folder_id").references((): AnyPgColumn => folders.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Untitled"),
  content: text("content").notNull().default(""),
  updatedBy: text("updated_by"),
  createdAt: created(),
  updatedAt: updated(),
});

/** Characters, mechanics, environments */
export const designItems = pgTable("design_items", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(), // 'characters' | 'mechanics' | 'environments'
  name: text("name").notNull(),
  fields: jsonb("fields").$type<Record<string, string>>().notNull().default({}),
  notes: text("notes").notNull().default(""),
  coverAssetId: integer("cover_asset_id"),
  updatedBy: text("updated_by"),
  createdAt: created(),
  updatedAt: updated(),
});

/** Uploaded image files */
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  storedName: text("stored_name").notNull(),
  originalName: text("original_name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  tag: text("tag").notNull().default(""),
  caption: text("caption").notNull().default(""),
  designItemId: integer("design_item_id").references(() => designItems.id, { onDelete: "cascade" }),
  uploadedBy: text("uploaded_by"),
  createdAt: created(),
});

/** Folders for storyboards and screenplay scripts, e.g. Season 1 > Episode 1 */
export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  section: text("section").notNull().default("storyboards"), // 'storyboards' | 'screenplay'
  name: text("name").notNull(),
  parentId: integer("parent_id").references((): AnyPgColumn => folders.id, { onDelete: "cascade" }),
  createdAt: created(),
});

export const boards = pgTable("boards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  folderId: integer("folder_id").references(() => folders.id, { onDelete: "cascade" }),
  createdAt: created(),
  updatedAt: updated(),
});

export const blocks = pgTable("blocks", {
  id: serial("id").primaryKey(),
  boardId: integer("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
  imageAssetId: integer("image_asset_id").references(() => assets.id, { onDelete: "set null" }),
  action: text("action").notNull().default(""),
  duration: real("duration").notNull().default(2),
  notes: text("notes").notNull().default(""),
  createdAt: created(),
});

export type User = typeof users.$inferSelect;
export type Doc = typeof docs.$inferSelect;
export type DesignItem = typeof designItems.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Folder = typeof folders.$inferSelect;
export type Board = typeof boards.$inferSelect;
export type Block = typeof blocks.$inferSelect;
