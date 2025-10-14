CREATE TABLE "damage_category" (
	"damage_category_id" serial PRIMARY KEY NOT NULL,
	"damage_category_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluation" (
	"evaluation_id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"house_category_id" integer NOT NULL,
	"damage_category_id" integer NOT NULL,
	"date_created" timestamp with time zone NOT NULL,
	"date_updated" timestamp with time zone,
	"date_deleted" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "house_category" (
	"house_category_id" serial PRIMARY KEY NOT NULL,
	"house_category_name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "date_created" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "date_updated" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "date_updated" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "date_deleted" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "evaluation" ADD CONSTRAINT "evaluation_request_id_request_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."request"("request_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluation" ADD CONSTRAINT "evaluation_house_category_id_house_category_house_category_id_fk" FOREIGN KEY ("house_category_id") REFERENCES "public"."house_category"("house_category_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluation" ADD CONSTRAINT "evaluation_damage_category_id_damage_category_damage_category_id_fk" FOREIGN KEY ("damage_category_id") REFERENCES "public"."damage_category"("damage_category_id") ON DELETE no action ON UPDATE no action;