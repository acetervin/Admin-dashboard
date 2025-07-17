import { pgTable, text, serial, integer, boolean, timestamp, decimal, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  pesapalTransactionId: text("pesapal_transaction_id"),
  pesapalMerchantReference: text("pesapal_merchant_reference").notNull(),
  type: text("type").notNull(), // donation, event_registration
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("KES"),
  status: text("status").notNull().default("PENDING"), // PENDING, COMPLETED, FAILED, CANCELLED
  paymentMethod: text("payment_method"), // M-Pesa, Airtel Money, Visa, Mastercard
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  description: text("description"),
  pesapalRedirectUrl: text("pesapal_redirect_url"),
  ipnData: text("ipn_data"), // JSON string of IPN response
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const donations = pgTable("donations", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id").notNull().references(() => transactions.id),
  donationType: text("donation_type").notNull(), // family_counseling, family_support, complete_program, custom
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  endTime: timestamp("end_time"),
  location: text("location").notNull(),
  maxParticipants: integer("max_participants"),
  registrationFee: decimal("registration_fee", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  transactionId: uuid("transaction_id").notNull().references(() => transactions.id),
  registrationType: text("registration_type").notNull(), // individual, organization
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  middleName: text("middle_name"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  organizationName: text("organization_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pesapalTokens = pgTable("pesapal_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pesapalIpnUrls = pgTable("pesapal_ipn_urls", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  ipnId: text("ipn_id").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
  donation: one(donations, {
    fields: [transactions.id],
    references: [donations.transactionId],
  }),
  eventRegistration: one(eventRegistrations, {
    fields: [transactions.id],
    references: [eventRegistrations.transactionId],
  }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  transaction: one(transactions, {
    fields: [donations.transactionId],
    references: [transactions.id],
  }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id],
  }),
  transaction: one(transactions, {
    fields: [eventRegistrations.transactionId],
    references: [transactions.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  transactionId: true,
  createdAt: true,
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  transactionId: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;
export type PesapalToken = typeof pesapalTokens.$inferSelect;
export type PesapalIpnUrl = typeof pesapalIpnUrls.$inferSelect;
