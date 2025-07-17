export interface Transaction {
  id: string;
  pesapalTransactionId?: string;
  pesapalMerchantReference: string;
  type: "donation" | "event_registration";
  amount: string;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  paymentMethod?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  endTime?: string;
  location: string;
  maxParticipants?: number;
  registrationFee: string;
  isActive: boolean;
  imageUrl?: string;
  registrationCount?: number;
}

export interface DashboardStats {
  totalDonations: number;
  donationCount: number;
  pendingPayments: number;
  successRate: string;
  recentTransactions: Transaction[];
  paymentMethods: Record<string, number>;
  monthlyStats: {
    totalTransactions: number;
    completedTransactions: number;
    failedTransactions: number;
  };
}

export interface PaymentInitiationResponse {
  transactionId: string;
  redirectUrl: string;
  merchantReference: string;
}

export interface DonationData {
  donationType: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  isAnonymous?: boolean;
  message?: string;
}

export interface EventRegistrationData {
  registrationType: "individual" | "organization";
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  organizationName?: string;
}
