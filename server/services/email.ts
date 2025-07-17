interface EmailService {
  sendDonationConfirmation(email: string, amount: number, transactionId: string): Promise<void>;
  sendEventRegistrationConfirmation(email: string, eventName: string, transactionId: string): Promise<void>;
  sendPaymentFailedNotification(email: string, amount: number, reason: string): Promise<void>;
}

class MockEmailService implements EmailService {
  async sendDonationConfirmation(email: string, amount: number, transactionId: string): Promise<void> {
    console.log(`[EMAIL] Donation confirmation sent to ${email}`);
    console.log(`Amount: KES ${amount}, Transaction: ${transactionId}`);
  }

  async sendEventRegistrationConfirmation(email: string, eventName: string, transactionId: string): Promise<void> {
    console.log(`[EMAIL] Event registration confirmation sent to ${email}`);
    console.log(`Event: ${eventName}, Transaction: ${transactionId}`);
  }

  async sendPaymentFailedNotification(email: string, amount: number, reason: string): Promise<void> {
    console.log(`[EMAIL] Payment failure notification sent to ${email}`);
    console.log(`Amount: KES ${amount}, Reason: ${reason}`);
  }
}

// In production, replace with actual email service (Nodemailer, SendGrid, etc.)
export const emailService = new MockEmailService();
