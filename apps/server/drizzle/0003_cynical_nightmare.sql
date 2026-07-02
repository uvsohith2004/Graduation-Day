CREATE TABLE "settings" (
	"id" text PRIMARY KEY NOT NULL,
	"is_registration_open" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
