import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function PaymentFailed() {
  const urlParams = new URLSearchParams(window.location.search);
  const reason = urlParams.get("reason") || "Unknown error occurred";

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-times text-error text-3xl"></i>
          </div>
          
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">Payment Failed</h1>
          <p className="text-xl text-neutral-600 mb-8">
            We encountered an issue processing your payment. Don't worry, no charges were made to your account.
          </p>

          <div className="bg-error/10 border border-error/20 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-error mb-2">Error Details</h3>
            <p className="text-sm text-neutral-600">{reason}</p>
          </div>

          <div className="bg-neutral-100 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-neutral-800 mb-4">What you can do:</h3>
            <ul className="text-left space-y-2 text-neutral-600">
              <li className="flex items-start space-x-2">
                <i className="fas fa-circle text-xs mt-2 text-neutral-400"></i>
                <span>Check your internet connection and try again</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-circle text-xs mt-2 text-neutral-400"></i>
                <span>Verify your payment details are correct</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-circle text-xs mt-2 text-neutral-400"></i>
                <span>Ensure sufficient funds are available</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="fas fa-circle text-xs mt-2 text-neutral-400"></i>
                <span>Contact your bank if the issue persists</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/donate">
              <Button>Try Again</Button>
            </Link>
            <Button variant="outline">
              <i className="fas fa-phone mr-2"></i>
              Contact Support
            </Button>
            <Link href="/">
              <Button variant="outline">Return Home</Button>
            </Link>
          </div>

          <div className="mt-8 text-sm text-neutral-500">
            <p>Need help? Contact us at support@familypeace.org or call +254 700 000 000</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
