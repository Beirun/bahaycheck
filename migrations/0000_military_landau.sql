CREATE TABLE "code" (
	"code_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"code" text NOT NULL,
	"date_created" timestamp NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_used" boolean
);
--> statement-breakpoint
CREATE TABLE "license" (
	"license_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"license_image" text NOT NULL,
	"specialization" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"notification_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" text NOT NULL,
	"date_created" timestamp NOT NULL,
	"date_updated" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "request" (
	"request_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"request_image" text NOT NULL,
	"request_details" text,
	"request_status" text NOT NULL,
	"longitude" double precision NOT NULL,
	"latitude" double precision NOT NULL,
	"volunteer_id" integer,
	"date_created" timestamp with time zone NOT NULL,
	"date_updated" timestamp with time zone,
	"date_deleted" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "role" (
	"role_id" serial PRIMARY KEY NOT NULL,
	"role_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone_number" text NOT NULL,
	"password_hash" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"date_created" timestamp with time zone NOT NULL,
	"date_updated" timestamp with time zone,
	"date_deleted" timestamp with time zone,
	CONSTRAINT "user_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
ALTER TABLE "code" ADD CONSTRAINT "code_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license" ADD CONSTRAINT "license_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_user_id_user_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request" ADD CONSTRAINT "request_volunteer_id_user_user_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."user"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_role_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("role_id") ON DELETE no action ON UPDATE no action;