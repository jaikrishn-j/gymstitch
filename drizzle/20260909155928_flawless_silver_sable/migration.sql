CREATE TABLE "plans" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "plans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"descriptions" text,
	"amount" numeric(10,2) NOT NULL,
	"offerPrice" numeric(10,2),
	"includedFeatures" text[] NOT NULL,
	"isAvailable" boolean DEFAULT true NOT NULL,
	"durationInDays" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
