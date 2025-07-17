import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { pesapalService } from "./services/pesapal";
import { emailService } from "./services/email";
import { 
  insertTransactionSchema,
  insertDonationSchema,
  insertEventRegistrationSchema,
  insertEventSchema
} from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";

// Session type extensions
declare global {
  namespace Express {
    interface SessionData {
      userId?: number;
      role?: string;
    }
  }
}

// Create default admin user
async function createDefaultAdmin() {
  try {
    const existingAdmin = await storage.getUserByUsername("admin");
    if (!existingAdmin) {
      await storage.createUser({
        username: "admin",
        email: "admin@familypeace.org",
        password: "admin123", // Change this in production
        role: "admin"
      });
      console.log("Default admin user created: admin/admin123");
    }
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
}

// Create sample events
async function createSampleEvents() {
  try {
    const existingEvents = await storage.getActiveEvents();
    if (existingEvents.length === 0) {
      await storage.createEvent({
        name: "Family Counseling Workshop",
        description: "Learn effective communication skills for stronger family relationships",
        date: new Date("2025-02-15T10:00:00Z"),
        endTime: new Date("2025-02-15T16:00:00Z"),
        location: "Family Peace Foundation Center, Nairobi",
        maxParticipants: 50,
        registrationFee: "2500",
        isActive: true,
        imageUrl: null
      });
      
      await storage.createEvent({
        name: "Youth Empowerment Summit",
        description: "Empowering young people with life skills and career guidance",
        date: new Date("2025-03-10T09:00:00Z"),
        endTime: new Date("2025-03-10T17:00:00Z"),
        location: "Kenyatta International Conference Centre",
        maxParticipants: 100,
        registrationFee: "1500",
        isActive: true,
        imageUrl: null
      });
      
      console.log("Sample events created successfully");
    }
  } catch (error) {
    console.error("Error creating sample events:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Pesapal IPN URL
  try {
    await pesapalService.initializeIpnUrl();
  } catch (error) {
    console.error("Failed to initialize IPN URL:", error);
    console.log("Donation payments will be disabled until Pesapal credentials are configured");
  }
  
  // Create default admin user if doesn't exist
  await createDefaultAdmin();
  
  // Create sample events
  await createSampleEvents();

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Simple session-based auth
      req.session.userId = user.id;
      req.session.role = user.role;
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    res.json({ 
      userId: req.session.userId, 
      role: req.session.role 
    });
  });

  // Middleware for admin routes
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session?.userId || req.session.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  };

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getActiveEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      const registrationCount = await storage.getEventRegistrationCount(event.id);
      res.json({ ...event, registrationCount });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", requireAdmin, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  // Donation routes
  app.post("/api/donations/initiate", async (req, res) => {
    try {
      const schema = z.object({
        donationType: z.string(),
        amount: z.number().positive(),
        customerName: z.string(),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        isAnonymous: z.boolean().default(false),
        message: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const merchantReference = `DON-${nanoid(10)}`;

      // Create transaction
      const transaction = await storage.createTransaction({
        pesapalMerchantReference: merchantReference,
        type: "donation",
        amount: data.amount.toString(),
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        description: `Donation - ${data.donationType}`,
      });

      // Create donation record
      await storage.createDonation({
        transactionId: transaction.id,
        donationType: data.donationType,
        amount: data.amount.toString(),
        isAnonymous: data.isAnonymous,
        message: data.message,
      });

      // Check if Pesapal is configured
      const ipnUrl = await storage.getPesapalIpnUrl();
      if (!ipnUrl) {
        // For testing without Pesapal, simulate successful payment
        await storage.updateTransactionStatus(transaction.id, "COMPLETED");
        
        const domains = process.env.REPLIT_DOMAINS?.split(",") || ["localhost:5000"];
        const domain = domains[0];
        const protocol = domain.includes("localhost") ? "http" : "https";
        const callbackUrl = `${protocol}://${domain}/payment-success?ref=${merchantReference}`;
        
        return res.json({
          transactionId: transaction.id,
          redirectUrl: callbackUrl,
          merchantReference,
          testMode: true
        });
      }

      // Prepare callback URL
      const domains = process.env.REPLIT_DOMAINS?.split(",") || ["localhost:5000"];
      const domain = domains[0];
      const protocol = domain.includes("localhost") ? "http" : "https";
      const callbackUrl = `${protocol}://${domain}/payment-success?ref=${merchantReference}`;

      // Submit to Pesapal
      const pesapalResponse = await pesapalService.submitOrderRequest({
        id: merchantReference,
        currency: "KES",
        amount: data.amount,
        description: `Family Peace Foundation - ${data.donationType}`,
        callback_url: callbackUrl,
        notification_id: ipnUrl.ipnId,
        billing_address: {
          email_address: data.customerEmail,
          phone_number: data.customerPhone,
          country_code: "KE",
          first_name: data.customerName.split(" ")[0] || "",
          last_name: data.customerName.split(" ").slice(1).join(" ") || "",
        },
      });

      // Update transaction with Pesapal tracking ID
      await storage.updateTransactionPesapalId(transaction.id, pesapalResponse.order_tracking_id);

      res.json({
        transactionId: transaction.id,
        redirectUrl: pesapalResponse.redirect_url,
        merchantReference,
      });
    } catch (error) {
      console.error("Donation initiation error:", error);
      res.status(500).json({ 
        error: "Failed to initiate donation", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Event registration routes
  app.post("/api/events/:eventId/register", async (req, res) => {
    try {
      const eventId = req.params.eventId;
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      const schema = z.object({
        registrationType: z.enum(["individual", "organization"]),
        firstName: z.string(),
        lastName: z.string(),
        middleName: z.string().optional(),
        email: z.string().email(),
        phone: z.string(),
        organizationName: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const merchantReference = `EVT-${nanoid(10)}`;

      // Check capacity
      const registrationCount = await storage.getEventRegistrationCount(eventId);
      if (event.maxParticipants && registrationCount >= event.maxParticipants) {
        return res.status(400).json({ error: "Event is full" });
      }

      // Create transaction
      const transaction = await storage.createTransaction({
        pesapalMerchantReference: merchantReference,
        type: "event_registration",
        amount: event.registrationFee,
        customerName: `${data.firstName} ${data.lastName}`,
        customerEmail: data.email,
        customerPhone: data.phone,
        description: `Event Registration - ${event.name}`,
      });

      // Create registration record
      await storage.createEventRegistration({
        eventId,
        transactionId: transaction.id,
        ...data,
      });

      // Get IPN URL
      const ipnUrl = await storage.getPesapalIpnUrl();
      if (!ipnUrl) {
        throw new Error("IPN URL not configured");
      }

      // Prepare callback URL
      const domains = process.env.REPLIT_DOMAINS?.split(",") || ["localhost:5000"];
      const domain = domains[0];
      const protocol = domain.includes("localhost") ? "http" : "https";
      const callbackUrl = `${protocol}://${domain}/payment-success?ref=${merchantReference}`;

      // Submit to Pesapal
      const pesapalResponse = await pesapalService.submitOrderRequest({
        id: merchantReference,
        currency: "KES",
        amount: Number(event.registrationFee),
        description: `Event Registration - ${event.name}`,
        callback_url: callbackUrl,
        notification_id: ipnUrl.ipnId,
        billing_address: {
          email_address: data.email,
          phone_number: data.phone,
          country_code: "KE",
          first_name: data.firstName,
          middle_name: data.middleName,
          last_name: data.lastName,
        },
      });

      // Update transaction with Pesapal tracking ID
      await storage.updateTransactionPesapalId(transaction.id, pesapalResponse.order_tracking_id);

      res.json({
        transactionId: transaction.id,
        redirectUrl: pesapalResponse.redirect_url,
        merchantReference,
      });
    } catch (error) {
      console.error("Event registration error:", error);
      res.status(500).json({ error: "Failed to register for event" });
    }
  });

  // Payment webhook (IPN)
  app.get("/api/payments/webhook", async (req, res) => {
    try {
      const { OrderTrackingId, OrderMerchantReference } = req.query;

      if (!OrderTrackingId || !OrderMerchantReference) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // Get transaction status from Pesapal
      const statusResponse = await pesapalService.getTransactionStatus(OrderTrackingId as string);
      
      // Find transaction by merchant reference
      const transaction = await storage.getTransactionByMerchantReference(OrderMerchantReference as string);
      
      if (!transaction) {
        console.error(`Transaction not found for reference: ${OrderMerchantReference}`);
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Map Pesapal status to our status
      let status = "PENDING";
      if (statusResponse.payment_status_code === "1") {
        status = "COMPLETED";
      } else if (statusResponse.payment_status_code === "2") {
        status = "FAILED";
      }

      // Update transaction
      await storage.updateTransactionStatus(
        transaction.id,
        status,
        JSON.stringify(statusResponse)
      );

      // Send email notifications
      if (status === "COMPLETED") {
        if (transaction.type === "donation") {
          await emailService.sendDonationConfirmation(
            transaction.customerEmail,
            Number(transaction.amount),
            transaction.id
          );
        } else if (transaction.type === "event_registration") {
          await emailService.sendEventRegistrationConfirmation(
            transaction.customerEmail,
            transaction.description || "Event",
            transaction.id
          );
        }
      } else if (status === "FAILED") {
        await emailService.sendPaymentFailedNotification(
          transaction.customerEmail,
          Number(transaction.amount),
          statusResponse.payment_status_description
        );
      }

      res.json({ status: "processed" });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Payment status check
  app.get("/api/payments/status/:merchantReference", async (req, res) => {
    try {
      const transaction = await storage.getTransactionByMerchantReference(req.params.merchantReference);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      res.json({
        status: transaction.status,
        amount: transaction.amount,
        description: transaction.description,
        createdAt: transaction.createdAt,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check payment status" });
    }
  });

  // Admin routes
  app.get("/api/admin/dashboard", requireAdmin, async (req, res) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        totalDonations,
        recentTransactions,
        pendingTransactions,
        monthlyTransactions
      ] = await Promise.all([
        storage.getTotalDonations(),
        storage.getTransactions(10),
        storage.getTransactionsByStatus("PENDING"),
        storage.getTransactionsByDateRange(thirtyDaysAgo, new Date())
      ]);

      // Calculate success rate
      const completedTransactions = monthlyTransactions.filter(t => t.status === "COMPLETED").length;
      const successRate = monthlyTransactions.length > 0 
        ? (completedTransactions / monthlyTransactions.length) * 100 
        : 0;

      // Payment method breakdown
      const paymentMethods = monthlyTransactions.reduce((acc, transaction) => {
        const method = transaction.paymentMethod || "Unknown";
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        totalDonations: totalDonations.total,
        donationCount: totalDonations.count,
        pendingPayments: pendingTransactions.length,
        successRate: successRate.toFixed(1),
        recentTransactions,
        paymentMethods,
        monthlyStats: {
          totalTransactions: monthlyTransactions.length,
          completedTransactions,
          failedTransactions: monthlyTransactions.filter(t => t.status === "FAILED").length,
        }
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ error: "Failed to load dashboard data" });
    }
  });

  app.get("/api/admin/transactions", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as string;

      let transactions;
      if (status && status !== "all") {
        transactions = await storage.getTransactionsByStatus(status);
      } else {
        transactions = await storage.getTransactions(limit, offset);
      }

      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
