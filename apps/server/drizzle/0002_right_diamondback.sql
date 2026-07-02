ALTER TABLE "alumni" ADD COLUMN "photo_edit_request" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "alumni" ADD COLUMN "can_edit_photo" boolean DEFAULT false NOT NULL;