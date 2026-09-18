import {
    boolean,
    integer,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";


/* =========================================================
   PLANS
   ========================================================= */

export const plansTable = pgTable("plans", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    name: varchar({ length: 255 }).notNull(),
    descriptions: text(),

    amount: numeric({
        precision: 10,
        scale: 2,
    }).notNull(),

    offerPrice: numeric({
        precision: 10,
        scale: 2,
    }),

    includedFeatures: text().array().notNull(),

    isAvailable: boolean().notNull().default(true),

    durationInDays: integer().notNull(),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});


/* =========================================================
   PAYMENTS
   ========================================================= */

export const paymentsTable = pgTable("payments", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    // Clerk user ID
    clerkId: varchar({ length: 255 }).notNull(),

    // NULL = payment is not associated with a plan
    // e.g. first-registration payment
    planId: integer().references(() => plansTable.id, {
        onDelete: "set null",
    }),

    // NULL for regular plans
    // Set for custom/exceptional plans
    planDurationDays: integer(),

    // Actual amount paid
    amount: numeric({
        precision: 10,
        scale: 2,
    }).notNull(),

    // When the payment was successfully made
    paidAt: timestamp().notNull().defaultNow(),

    // Payment provider / method
    // Examples: CASH, UPI, RAZORPAY
    paymentMethod: varchar({
        length: 50,
    }).notNull(),

    // Payment gateway
    // Example: RAZORPAY
    paymentGateway: varchar({
        length: 50,
    }),

    // Razorpay payment ID
    gatewayPaymentId: varchar({
        length: 255,
    }),

    // Razorpay order ID
    gatewayOrderId: varchar({
        length: 255,
    }),

    // Payment state
    // Examples: SUCCESS, PENDING, FAILED, REFUNDED
    status: varchar({
        length: 30,
    }).notNull().default("SUCCESS"),

    // Optional description
    description: text(),

    createdAt: timestamp().notNull().defaultNow(),
});


/* =========================================================
   GYM SETTINGS
   ========================================================= */

export const gymSettingsTable = pgTable("gym_settings", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    gymName: varchar({
        length: 255,
    }).notNull(),

    gymDescription: text(),

    registrationAmount: numeric({
        precision: 10,
        scale: 2,
    }).notNull().default("0"),

    phone: varchar({
        length: 30,
    }),

    email: varchar({
        length: 255,
    }),

    address: text(),

    websiteUrl: varchar({
        length: 500,
    }),

    instagramUrl: varchar({
        length: 500,
    }),

    facebookUrl: varchar({
        length: 500,
    }),

    youtubeUrl: varchar({
        length: 500,
    }),

    whatsappNumber: varchar({
        length: 30,
    }),

    // =====================================================
    // Razorpay / Online Payment Collection
    // =====================================================

    // Master switch for online Razorpay payments
    razorpayEnabled: boolean()
        .notNull()
        .default(false),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});


/* =========================================================
   PAYMENT REQUEST STATUS
   ========================================================= */

export const paymentRequestStatusEnum = pgEnum(
    "payment_request_status",
    [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "CANCELLED",
    ],
);


/* =========================================================
   PAYMENT REQUESTS
   ========================================================= */

export const paymentRequestsTable = pgTable("payment_requests", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    // =====================================================
    // User who created the request
    // =====================================================

    clerkId: varchar({
        length: 255,
    }).notNull(),

    // =====================================================
    // Requested plan
    // =====================================================

    planId: integer().references(() => plansTable.id, {
        onDelete: "set null",
    }),

    // Amount requested
    // Stored separately so the request retains the
    // requested amount even if the plan price changes later.
    amount: numeric({
        precision: 10,
        scale: 2,
    }).notNull(),

    // Custom/exceptional duration if required
    planDurationDays: integer(),

    // User's optional message/reason
    description: text(),

    // =====================================================
    // Request Status
    // =====================================================

    status: paymentRequestStatusEnum()
        .notNull()
        .default("PENDING"),

    // =====================================================
    // Admin/Staff Handling
    // =====================================================

    // Clerk ID of the admin/staff who handled the request
    handledByClerkId: varchar({
        length: 255,
    }),

    // When the request was accepted/rejected
    handledAt: timestamp(),

    // Optional note from admin/staff
    // Particularly useful for rejection
    adminNote: text(),

    // =====================================================
    // Notification State
    // =====================================================

    // false = unread notification
    // true = admin has viewed the request
    isRead: boolean()
        .notNull()
        .default(false),

    // =====================================================
    // Resulting Payment
    // =====================================================

    // Set when an accepted request results in a payment
    paymentId: integer().references(() => paymentsTable.id, {
        onDelete: "set null",
    }),

    // =====================================================
    // Timestamps
    // =====================================================

    createdAt: timestamp()
        .notNull()
        .defaultNow(),

    updatedAt: timestamp()
        .notNull()
        .defaultNow(),
});


/* =========================================================
   WEIGHT LOGS
   ========================================================= */

export const weightLogsTable = pgTable("weight_logs", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    clerkId: varchar({
        length: 255,
    }).notNull(),

    weight: numeric({
        precision: 5,
        scale: 2,
    }).notNull(),

    loggedAt: timestamp()
        .notNull()
        .defaultNow(),
});


/* =========================================================
   WEIGHT GOALS
   ========================================================= */

export const weightGoalsTable = pgTable("weight_goals", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    clerkId: varchar({
        length: 255,
    }).notNull(),

    targetWeight: numeric({
        precision: 5,
        scale: 2,
    }).notNull(),

    createdAt: timestamp()
        .notNull()
        .defaultNow(),
    updatedAt: timestamp()
        .notNull()
        .defaultNow(),
});