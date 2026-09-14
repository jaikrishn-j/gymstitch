CREATE TABLE "gym_settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gym_settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"gymName" varchar(255) NOT NULL,
	"gymDescription" text,
	"registrationAmount" numeric(10,2) DEFAULT '0' NOT NULL,
	"phone" varchar(30),
	"email" varchar(255),
	"address" text,
	"websiteUrl" varchar(500),
	"instagramUrl" varchar(500),
	"facebookUrl" varchar(500),
	"youtubeUrl" varchar(500),
	"whatsappNumber" varchar(30),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
