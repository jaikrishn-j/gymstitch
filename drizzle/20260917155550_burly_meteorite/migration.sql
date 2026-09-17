CREATE TYPE "payment_request_status" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "payment_requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payment_requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clerkId" varchar(255) NOT NULL,
	"planId" integer,
	"amount" numeric(10,2) NOT NULL,
	"planDurationDays" integer,
	"description" text,
	"status" "payment_request_status" DEFAULT 'PENDING'::"payment_request_status" NOT NULL,
	"handledByClerkId" varchar(255),
	"handledAt" timestamp,
	"adminNote" text,
	"isRead" boolean DEFAULT false NOT NULL,
	"paymentId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_planId_plans_id_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_paymentId_payments_id_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL;