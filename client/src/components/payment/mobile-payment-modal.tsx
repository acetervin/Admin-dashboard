import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MobilePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onPaymentMethodSelect: (method: string, phone?: string) => void;
}

export default function MobilePaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  description,
  onPaymentMethodSelect 
}: MobilePaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const paymentMethods = [
    {
      id: "mpesa",
      name: "M-Pesa",
      description: "Pay with your Safaricom line",
      icon: "fas fa-mobile-alt",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      requiresPhone: true,
    },
    {
      id: "airtel",
      name: "Airtel Money", 
      description: "Pay with your Airtel line",
      icon: "fas fa-phone",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      requiresPhone: true,
    },
    {
      id: "card",
      name: "Visa/Mastercard",
      description: "Pay with your card",
      icon: "fas fa-credit-card", 
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      requiresPhone: false,
    },
  ];

  const handlePayment = () => {
    if (!selectedMethod) return;
    
    const method = paymentMethods.find(m => m.id === selectedMethod);
    if (method?.requiresPhone && !phoneNumber) return;
    
    onPaymentMethodSelect(selectedMethod, phoneNumber || undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <i className="fas fa-credit-card text-primary"></i>
            <span>Choose Payment Method</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Amount Display */}
          <div className="text-center bg-neutral-50 p-4 rounded-lg">
            <h4 className="text-2xl font-bold text-neutral-800 mb-2">KES {amount}</h4>
            <p className="text-neutral-600">{description}</p>
          </div>
          
          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Select Payment Method</Label>
            
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === method.id 
                    ? "border-primary bg-primary/5" 
                    : "border-neutral-200 hover:border-primary/50"
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${method.bgColor} rounded-lg flex items-center justify-center`}>
                    <i className={`${method.icon} ${method.textColor} text-lg`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-800">{method.name}</p>
                    <p className="text-sm text-neutral-500">{method.description}</p>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                    {selectedMethod === method.id && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Phone Number Input for Mobile Money */}
          {selectedMethod && paymentMethods.find(m => m.id === selectedMethod)?.requiresPhone && (
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="254712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Enter your phone number for {paymentMethods.find(m => m.id === selectedMethod)?.name} payments
              </p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={!selectedMethod || (paymentMethods.find(m => m.id === selectedMethod)?.requiresPhone && !phoneNumber)}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Pay Now
            </Button>
          </div>
          
          {/* Security Info */}
          <div className="text-center pt-4 border-t border-neutral-200">
            <div className="flex items-center justify-center space-x-4 text-xs text-neutral-500">
              <span className="flex items-center space-x-1">
                <i className="fas fa-lock"></i>
                <span>SSL Encrypted</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <i className="fas fa-shield-alt"></i>
                <span>Secure</span>
              </span>
              <span>•</span>
              <span>Powered by Pesapal</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
