import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function PaymentSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const merchantReference = urlParams.get("ref");

  const { data: paymentStatus, isLoading } = useQuery({
    queryKey: ["/api/payments/status", merchantReference],
    enabled: !!merchantReference,
  });

  if (!merchantReference) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-error text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">Invalid Payment Reference</h1>
          <p className="text-neutral-600 mb-8">
            No payment reference found. Please check your payment confirmation email.
          </p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">Confirming Payment...</h1>
          <p className="text-neutral-600">Please wait while we verify your payment status.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const isCompleted = paymentStatus?.status === "COMPLETED";
  const isPending = paymentStatus?.status === "PENDING";

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {isCompleted ? (
            <>
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-check text-success text-3xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-4">Payment Successful!</h1>
              <p className="text-xl text-neutral-600 mb-8">
                Thank you for your generous contribution to Family Peace Foundation.
              </p>
            </>
          ) : isPending ? (
            <>
              <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-clock text-warning text-3xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-4">Payment Pending</h1>
              <p className="text-xl text-neutral-600 mb-8">
                Your payment is being processed. You will receive a confirmation email once completed.
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-times text-error text-3xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-4">Payment Failed</h1>
              <p className="text-xl text-neutral-600 mb-8">
                There was an issue processing your payment. Please try again or contact support.
              </p>
            </>
          )}

          <Card className="max-w-md mx-auto mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold text-neutral-800 mb-4">Payment Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Transaction ID:</span>
                  <span className="font-mono text-neutral-800">{merchantReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Amount:</span>
                  <span className="font-semibold text-neutral-800">KES {paymentStatus?.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Description:</span>
                  <span className="text-neutral-800">{paymentStatus?.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Date:</span>
                  <span className="text-neutral-800">
                    {paymentStatus?.createdAt ? new Date(paymentStatus.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Status:</span>
                  <span className={`font-semibold ${
                    isCompleted ? "text-success" : isPending ? "text-warning" : "text-error"
                  }`}>
                    {paymentStatus?.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {isCompleted && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <i className="fas fa-envelope text-success"></i>
                <span className="font-medium text-success">Confirmation Email Sent</span>
              </div>
              <p className="text-sm text-neutral-600">
                A confirmation email with your receipt has been sent to your email address.
                Keep this for your tax records.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline">Return Home</Button>
            </Link>
            {!isCompleted && (
              <Link href="/donate">
                <Button>Try Again</Button>
              </Link>
            )}
            {isCompleted && (
              <Link href="/donate">
                <Button>Make Another Donation</Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
