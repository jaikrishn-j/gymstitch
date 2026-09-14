CREATE TABLE "payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clerkId" varchar(255) NOT NULL,
	"planId" integer,
	"amount" numeric(10,2) NOT NULL,
	"paidAt" timestamp DEFAULT now() NOT NULL,
	"paymentMethod" varchar(50) NOT NULL,
	"paymentGateway" varchar(50),
	"gatewayPaymentId" varchar(255),
	"gatewayOrderId" varchar(255),
	"status" varchar(30) DEFAULT 'SUCCESS' NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_planId_plans_id_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE SET NULL;