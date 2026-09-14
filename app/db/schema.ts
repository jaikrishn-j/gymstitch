import {
    boolean,
    integer,
    numeric,
    pgTable,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";


export const plansTable = pgTable("plans", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    name: varchar({ length: 255 }).notNull(),
    descriptions: text(),

    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    offerPrice: numeric({ precision: 10, scale: 2 }),

    includedFeatures: text().array().notNull(),

    isAvailable: boolean().notNull().default(true),

    durationInDays: integer().notNull(),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});


export const paymentsTable = pgTable("payments", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    // Clerk user ID
    clerkId: varchar({ length: 255 }).notNull(),

    // NULL = payment is not associated with a plan
    // e.g. first-registration payment
    planId: integer().references(() => plansTable.id, {
        onDelete: "set null",
    }),

    // NULL for regular plans (use plansTable.durationInDays)
    // Set for custom/exceptional plans
    planDurationDays: integer(),

    // Actual amount paid
    amount: numeric({ precision: 10, scale: 2 }).notNull(),

    // When the payment was successfully made
    paidAt: timestamp().notNull().defaultNow(),

    // Payment provider / method
    paymentMethod: varchar({ length: 50 }).notNull(),

    // Razorpay order/payment IDs, if applicable
    paymentGateway: varchar({ length: 50 }),
    gatewayPaymentId: varchar({ length: 255 }),
    gatewayOrderId: varchar({ length: 255 }),

    // Payment state
    status: varchar({ length: 30 }).notNull().default("SUCCESS"),

    // Optional description for exceptional payments
    description: text(),

    createdAt: timestamp().notNull().defaultNow(),
});


export const gymSettingsTable = pgTable("gym_settings", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    gymName: varchar({ length: 255 }).notNull(),
    gymDescription: text(),

    registrationAmount: numeric({
        precision: 10,
        scale: 2,
    }).notNull().default("0"),

    phone: varchar({ length: 30 }),
    email: varchar({ length: 255 }),
    address: text(),

    websiteUrl: varchar({ length: 500 }),

    instagramUrl: varchar({ length: 500 }),
    facebookUrl: varchar({ length: 500 }),
    youtubeUrl: varchar({ length: 500 }),
    whatsappNumber: varchar({ length: 30 }),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});