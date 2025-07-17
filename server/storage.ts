import { 
  users, 
  transactions, 
  donations, 
  events, 
  eventRegistrations,
  pesapalTokens,
  pesapalIpnUrls,
  type User, 
  type InsertUser,
  type Transaction,
  type InsertTransaction,
  type Donation,
  type InsertDonation,
  type Event,
  type InsertEvent,
  type EventRegistration,
  type InsertEventRegistration,
  type PesapalToken,
  type PesapalIpnUrl
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionByMerchantReference(reference: string): Promise<Transaction | undefined>;
  updateTransactionStatus(id: string, status: string, ipnData?: string): Promise<void>;
  updateTransactionPesapalId(id: string, pesapalTransactionId: string): Promise<void>;
  getTransactions(limit?: number, offset?: number): Promise<Transaction[]>;
  getTransactionsByStatus(status: string): Promise<Transaction[]>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;

  // Donations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationsByDateRange(startDate: Date, endDate: Date): Promise<Donation[]>;
  getTotalDonations(): Promise<{ total: number; count: number }>;

  // Events
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | undefined>;
  getEvents(): Promise<Event[]>;
  getActiveEvents(): Promise<Event[]>;
  updateEvent(id: string, updates: Partial<Event>): Promise<void>;

  // Event Registrations
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;
  getEventRegistrations(eventId: string): Promise<EventRegistration[]>;
  getEventRegistrationCount(eventId: string): Promise<number>;

  // Pesapal Tokens
  savePesapalToken(token: string, expiryDate: Date): Promise<PesapalToken>;
  getValidPesapalToken(): Promise<PesapalToken | undefined>;

  // Pesapal IPN URLs
  savePesapalIpnUrl(url: string, ipnId: string): Promise<PesapalIpnUrl>;
  getPesapalIpnUrl(): Promise<PesapalIpnUrl | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Transactions
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [result] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return result;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async getTransactionByMerchantReference(reference: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.pesapalMerchantReference, reference));
    return transaction || undefined;
  }

  async updateTransactionStatus(id: string, status: string, ipnData?: string): Promise<void> {
    await db
      .update(transactions)
      .set({ 
        status, 
        ipnData,
        updatedAt: new Date() 
      })
      .where(eq(transactions.id, id));
  }

  async updateTransactionPesapalId(id: string, pesapalTransactionId: string): Promise<void> {
    await db
      .update(transactions)
      .set({ 
        pesapalTransactionId,
        updatedAt: new Date() 
      })
      .where(eq(transactions.id, id));
  }

  async getTransactions(limit = 50, offset = 0): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getTransactionsByStatus(status: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.status, status))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(and(
        gte(transactions.createdAt, startDate),
        lte(transactions.createdAt, endDate)
      ))
      .orderBy(desc(transactions.createdAt));
  }

  // Donations
  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [result] = await db
      .insert(donations)
      .values(donation)
      .returning();
    return result;
  }

  async getDonationsByDateRange(startDate: Date, endDate: Date): Promise<Donation[]> {
    return await db
      .select()
      .from(donations)
      .where(and(
        gte(donations.createdAt, startDate),
        lte(donations.createdAt, endDate)
      ))
      .orderBy(desc(donations.createdAt));
  }

  async getTotalDonations(): Promise<{ total: number; count: number }> {
    const result = await db
      .select({
        total: sql<number>`COALESCE(SUM(${donations.amount}), 0)`,
        count: sql<number>`COUNT(*)`
      })
      .from(donations);
    
    return {
      total: Number(result[0].total),
      count: Number(result[0].count)
    };
  }

  // Events
  async createEvent(event: InsertEvent): Promise<Event> {
    const [result] = await db
      .insert(events)
      .values(event)
      .returning();
    return result;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));
    return event || undefined;
  }

  async getEvents(): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .orderBy(desc(events.createdAt));
  }

  async getActiveEvents(): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.isActive, true))
      .orderBy(events.date);
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<void> {
    await db
      .update(events)
      .set(updates)
      .where(eq(events.id, id));
  }

  // Event Registrations
  async createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration> {
    const [result] = await db
      .insert(eventRegistrations)
      .values(registration)
      .returning();
    return result;
  }

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    return await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId))
      .orderBy(desc(eventRegistrations.createdAt));
  }

  async getEventRegistrationCount(eventId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));
    
    return Number(result[0].count);
  }

  // Pesapal Tokens
  async savePesapalToken(token: string, expiryDate: Date): Promise<PesapalToken> {
    const [result] = await db
      .insert(pesapalTokens)
      .values({ token, expiryDate })
      .returning();
    return result;
  }

  async getValidPesapalToken(): Promise<PesapalToken | undefined> {
    const [token] = await db
      .select()
      .from(pesapalTokens)
      .where(gte(pesapalTokens.expiryDate, new Date()))
      .orderBy(desc(pesapalTokens.createdAt))
      .limit(1);
    return token || undefined;
  }

  // Pesapal IPN URLs
  async savePesapalIpnUrl(url: string, ipnId: string): Promise<PesapalIpnUrl> {
    const [result] = await db
      .insert(pesapalIpnUrls)
      .values({ url, ipnId, isActive: true })
      .returning();
    return result;
  }

  async getPesapalIpnUrl(): Promise<PesapalIpnUrl | undefined> {
    const [ipnUrl] = await db
      .select()
      .from(pesapalIpnUrls)
      .where(eq(pesapalIpnUrls.isActive, true))
      .orderBy(desc(pesapalIpnUrls.createdAt))
      .limit(1);
    return ipnUrl || undefined;
  }
}

export const storage = new DatabaseStorage();
