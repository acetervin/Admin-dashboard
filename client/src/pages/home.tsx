import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-800 mb-6">
            Make a <span className="text-primary">Difference</span> Today
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
            Your generous support helps us provide essential family counseling services, 
            conflict resolution programs, and community outreach to those who need it most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/donate">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3">
                Donate Now
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-3">
              Learn About Our Impact
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">Your Impact</h2>
            <p className="text-neutral-600">See how your donation directly helps families in our community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-heart text-primary text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800 mb-2">$50</h3>
                <h4 className="text-lg font-semibold text-neutral-700 mb-4">Family Counseling Session</h4>
                <p className="text-neutral-600 mb-6">
                  Provides one hour of professional family counseling to help resolve conflicts and strengthen relationships.
                </p>
                <Link href="/donate?amount=50&type=family_counseling">
                  <Button className="w-full">Donate $50</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative border-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
              </div>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-users text-secondary text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800 mb-2">$150</h3>
                <h4 className="text-lg font-semibold text-neutral-700 mb-4">Family Support Package</h4>
                <p className="text-neutral-600 mb-6">
                  Covers three counseling sessions plus access to our family resource library and workshops.
                </p>
                <Link href="/donate?amount=150&type=family_support">
                  <Button className="w-full">Donate $150</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-home text-success text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-neutral-800 mb-2">$300</h3>
                <h4 className="text-lg font-semibold text-neutral-700 mb-4">Complete Program Access</h4>
                <p className="text-neutral-600 mb-6">
                  Full access to all our programs including counseling, workshops, and ongoing family support services.
                </p>
                <Link href="/donate?amount=300&type=complete_program">
                  <Button className="w-full">Donate $300</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">Why Your Support Matters</h2>
            <p className="text-neutral-600 max-w-3xl mx-auto">
              Every family deserves access to professional support during challenging times. 
              Your donation directly funds our mission to strengthen family bonds and create healthier communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-md text-primary text-2xl"></i>
              </div>
              <h4 className="text-lg font-semibold text-neutral-800 mb-2">Professional Counseling</h4>
              <p className="text-neutral-600">Licensed therapists providing expert family guidance</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-phone text-error text-2xl"></i>
              </div>
              <h4 className="text-lg font-semibold text-neutral-800 mb-2">Crisis Intervention</h4>
              <p className="text-neutral-600">24/7 support for families in immediate need</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar text-secondary text-2xl"></i>
              </div>
              <h4 className="text-lg font-semibold text-neutral-800 mb-2">Community Programs</h4>
              <p className="text-neutral-600">Educational workshops and family strengthening activities</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-book text-success text-2xl"></i>
              </div>
              <h4 className="text-lg font-semibold text-neutral-800 mb-2">Resource Library</h4>
              <p className="text-neutral-600">Access to books, materials, and online resources</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
