import { storage } from "../storage";

interface PesapalAuthResponse {
  token: string;
  expiryDate: string;
  error: any;
  status: string;
  message: string;
}

interface PesapalIpnResponse {
  url: string;
  created_date: string;
  ipn_id: string;
  error: any;
  status: string;
}

interface PesapalOrderRequest {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id: string;
  billing_address: {
    email_address: string;
    phone_number?: string;
    country_code: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    line_1?: string;
    line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    zip_code?: string;
  };
}

interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  error: any;
  status: string;
}

interface PesapalTransactionStatusResponse {
  payment_method: string;
  amount: number;
  created_date: string;
  confirmation_code: string;
  payment_status_description: string;
  description: string;
  message: string;
  payment_account: string;
  call_back_url: string;
  status_code: number;
  merchant_reference: string;
  payment_status_code: string;
  currency: string;
  error: any;
  status: string;
}

export class PesapalService {
  private readonly baseUrl: string;
  private readonly consumerKey: string;
  private readonly consumerSecret: string;

  constructor() {
    const isProduction = process.env.NODE_ENV === "production";
    this.baseUrl = isProduction 
      ? "https://pay.pesapal.com/v3/api"
      : "https://cybqa.pesapal.com/pesapalv3/api";
    
    this.consumerKey = process.env.PESAPAL_CONSUMER_KEY || "9fBwia4RHN0JpKyPLFQKoondEdKZWwuf";
    this.consumerSecret = process.env.PESAPAL_CONSUMER_SECRET || "hGgZzqtmKvcr/oVDAc46/6PCaGs=";
  }

  async getAccessToken(): Promise<string> {
    // Check for valid cached token
    const cachedToken = await storage.getValidPesapalToken();
    if (cachedToken && new Date(cachedToken.expiryDate) > new Date()) {
      return cachedToken.token;
    }

    // Request new token
    const response = await fetch(`${this.baseUrl}/Auth/RequestToken`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data: PesapalAuthResponse = await response.json();
    
    if (data.error) {
      throw new Error(`Pesapal auth error: ${data.error.message}`);
    }

    // Save token to database
    await storage.savePesapalToken(data.token, new Date(data.expiryDate));
    
    return data.token;
  }

  async registerIpnUrl(url: string): Promise<string> {
    // Check if IPN URL is already registered
    const existingIpn = await storage.getPesapalIpnUrl();
    if (existingIpn && existingIpn.url === url) {
      return existingIpn.ipnId;
    }

    const token = await this.getAccessToken();
    
    const response = await fetch(`${this.baseUrl}/URLSetup/RegisterIPN`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: url,
        ipn_notification_type: "GET",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to register IPN URL: ${response.statusText}`);
    }

    const data: PesapalIpnResponse = await response.json();
    
    if (data.error) {
      throw new Error(`Pesapal IPN registration error: ${data.error.message}`);
    }

    // Save IPN URL to database
    await storage.savePesapalIpnUrl(url, data.ipn_id);
    
    return data.ipn_id;
  }

  async submitOrderRequest(orderData: PesapalOrderRequest): Promise<PesapalOrderResponse> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${this.baseUrl}/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit order request: ${response.statusText}`);
    }

    const data: PesapalOrderResponse = await response.json();
    
    if (data.error) {
      throw new Error(`Pesapal order submission error: ${data.error.message}`);
    }

    return data;
  }

  async getTransactionStatus(orderTrackingId: string): Promise<PesapalTransactionStatusResponse> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${this.baseUrl}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get transaction status: ${response.statusText}`);
    }

    const data: PesapalTransactionStatusResponse = await response.json();
    
    if (data.error) {
      throw new Error(`Pesapal transaction status error: ${data.error.message}`);
    }

    return data;
  }

  async initializeIpnUrl(): Promise<void> {
    try {
      const domains = process.env.REPLIT_DOMAINS?.split(",") || ["localhost:5000"];
      const domain = domains[0];
      const protocol = domain.includes("localhost") ? "http" : "https";
      const ipnUrl = `${protocol}://${domain}/api/payments/webhook`;
      
      await this.registerIpnUrl(ipnUrl);
      console.log(`IPN URL registered: ${ipnUrl}`);
    } catch (error) {
      console.error("Failed to initialize IPN URL:", error);
    }
  }
}

export const pesapalService = new PesapalService();
