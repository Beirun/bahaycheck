CREATE TABLE "request_status" (
	"request_status_id" serial PRIMARY KEY NOT NULL,
	"request_status_name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evaluation" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "request" ADD COLUMN "request_status_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_request_status_id_request_status_request_status_id_fk" FOREIGN KEY ("request_status_id") REFERENCES "public"."request_status"("request_status_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" DROP COLUMN "request_status";