CREATE TABLE "eligibility" (
	"id" serial PRIMARY KEY NOT NULL,
	"roll_number" varchar(20) NOT NULL,
	"student_name" varchar(255) NOT NULL,
	"branch" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "eligibility_roll_number_idx" ON "eligibility" USING btree ("roll_number");