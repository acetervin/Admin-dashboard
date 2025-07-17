import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { DonationData, PaymentInitiationResponse } from "@/types";

interface PaymentFormProps {
  type: "donation" | "event";
  eventId?: string;
  eventFee?: string;
  eventName?: string;
  defaultAmount?: number;
  defaultType?: string;
}

export default function PaymentForm({ 
  type, 
  eventId, 
  eventFee, 
  eventName,
  defaultAmount = 50,
  defaultType = "family_counseling"
}: PaymentFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<DonationData>({
    donationType: defaultType,
    amount: defaultAmount,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    isAnonymous: false,
    message: "",
  });

  const initiateDonation = useMutation({
    mutationFn: async (data: DonationData): Promise<PaymentInitiationResponse> => {
      const response = await apiRequest("POST", "/api/donations/initiate", data);
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = data.redirectUrl;
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    initiateDonation.mutate(formData);
  };

  if (type === "event") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Registration Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-neutral-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-neutral-800">Event:</span>
              <span className="text-neutral-600">{eventName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-neutral-800">Registration Fee:</span>
              <span className="font-semibold text-lg">KES {eventFee}</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-neutral-600 mb-4">
              Registration details will be collected in the previous step. 
              Click below to proceed with payment.
            </p>
            <Button className="w-full bg-primary hover:bg-primary/90">
              Proceed to Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const predefinedAmounts = [
    { amount: 50, type: "family_counseling", label: "Family Counseling Session" },
    { amount: 150, type: "family_support", label: "Family Support Package" },
    { amount: 300, type: "complete_program", label: "Complete Program Access" },
  ];

  return (
    <div className="space-y-6">
      {/* Donation Options */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {predefinedAmounts.map((option) => (
              <div
                key={option.type}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.donationType === option.type 
                    ? "border-primary bg-primary/5" 
                    : "border-neutral-200 hover:border-primary/50"
                }`}
                onClick={() => setFormData({ ...formData, donationType: option.type, amount: option.amount })}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                        {formData.donationType === option.type && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800">KES {option.amount}</h3>
                        <p className="text-sm text-neutral-600">{option.label}</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-heart text-primary"></i>
                  </div>
                </div>
              </div>
            ))}

            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.donationType === "custom" 
                  ? "border-primary bg-primary/5" 
                  : "border-neutral-200 hover:border-primary/50"
              }`}
              onClick={() => setFormData({ ...formData, donationType: "custom" })}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                      {formData.donationType === "custom" && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800">Custom Amount</h3>
                      <p className="text-sm text-neutral-600">Choose your own amount</p>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <i className="fas fa-edit text-secondary"></i>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Donation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formData.donationType === "custom" && (
              <div>
                <Label htmlFor="amount">Donation Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="customerName">Full Name</Label>
              <Input
                id="customerName"
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="customerEmail">Email Address</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="customerPhone">Phone Number (Optional)</Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="254712345678"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Leave a message of support..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAnonymous"
                checked={formData.isAnonymous}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isAnonymous: checked as boolean })
                }
              />
              <Label htmlFor="isAnonymous">Make this donation anonymous</Label>
            </div>

            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-neutral-800">Total Amount:</span>
                <span className="font-bold text-xl text-primary">KES {formData.amount}</span>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={initiateDonation.isPending}
            >
              {initiateDonation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `Donate KES ${formData.amount}`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Payment Security Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-shield-alt text-success"></i>
            <span>Safe & Secure Donations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-mobile-alt text-green-600"></i>
              <span>M-Pesa</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-phone text-red-600"></i>
              <span>Airtel Money</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-credit-card text-blue-600"></i>
              <span>Visa/Mastercard</span>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4 text-xs text-neutral-500">
            <span className="flex items-center space-x-1">
              <i className="fas fa-lock"></i>
              <span>SSL Encrypted</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <i className="fas fa-shield-alt"></i>
              <span>Privacy Protected</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <i className="fas fa-receipt"></i>
              <span>Instant Receipt</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
