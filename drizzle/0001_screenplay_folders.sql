ALTER TABLE "docs" ADD COLUMN "folder_id" integer;--> statement-breakpoint
ALTER TABLE "folders" ADD COLUMN "section" text DEFAULT 'storyboards' NOT NULL;--> statement-breakpoint
ALTER TABLE "docs" ADD CONSTRAINT "docs_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;