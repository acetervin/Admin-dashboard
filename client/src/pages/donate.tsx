import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import type { DonationData, PaymentInitiationResponse } from "@/types";

export default function Donate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<DonationData>({
    donationType: "family_counseling",
    amount: 50,
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
      // Redirect to Pesapal payment page
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

  const predefinedAmounts = [
    { amount: 50, type: "family_counseling", label: "Family Counseling Session" },
    { amount: 150, type: "family_support", label: "Family Support Package" },
    { amount: 300, type: "complete_program", label: "Complete Program Access" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">
            Make a <span className="text-primary">Difference</span> Today
          </h1>
          <p className="text-xl text-neutral-600">
            Your generous support helps us provide essential family counseling services, 
            conflict resolution programs, and community outreach to those who need it most.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donation Options */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-6">Your Impact</h2>
              <div className="space-y-4">
                {predefinedAmounts.map((option) => (
                  <Card 
                    key={option.type}
                    className={`cursor-pointer transition-colors ${
                      formData.donationType === option.type ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onClick={() => setFormData({ ...formData, donationType: option.type, amount: option.amount })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-neutral-800">${option.amount}</h3>
                          <p className="text-sm text-neutral-600">{option.label}</p>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                          {formData.donationType === option.type && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card 
                  className={`cursor-pointer transition-colors ${
                    formData.donationType === "custom" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                  onClick={() => setFormData({ ...formData, donationType: "custom" })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-neutral-800">Custom Amount</h3>
                        <p className="text-sm text-neutral-600">Choose your own amount</p>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                        {formData.donationType === "custom" && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Security */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-shield-alt text-success"></i>
                    <span>Safe & Secure Donations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
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
                  <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-neutral-500">
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

            {/* Donation Form */}
            <div>
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

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={initiateDonation.isPending}
                    >
                      {initiateDonation.isPending ? "Processing..." : `Donate KES ${formData.amount}`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
