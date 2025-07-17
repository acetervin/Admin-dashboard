import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminSidebar from "@/components/admin/sidebar";
import StatsCards from "@/components/admin/stats-cards";
import TransactionTable from "@/components/admin/transaction-table";
import type { DashboardStats } from "@/types";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  const { data: dashboardData, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard"],
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/admin/transactions"],
  });

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-error text-2xl"></i>
            </div>
            <h1 className="text-xl font-bold text-neutral-800 mb-2">Access Denied</h1>
            <p className="text-neutral-600 mb-4">
              You don't have permission to access this area.
            </p>
            <Button onClick={() => setLocation("/admin/login")}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="flex">
          <AdminSidebar />
          <div className="flex-1 p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
              <div className="grid grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-neutral-200 rounded"></div>
                ))}
              </div>
              <div className="h-96 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex">
        <AdminSidebar />
        
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-neutral-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-800">Payment Dashboard</h2>
                <p className="text-neutral-600">Manage donations and event registrations</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm text-neutral-600">Real-time Updates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-white text-sm"></i>
                  </div>
                  <span className="text-sm font-medium text-neutral-800">Admin</span>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-6">
            {dashboardData && <StatsCards stats={dashboardData} />}

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Payment Methods Chart */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4">Payment Methods</h3>
                  <div className="space-y-4">
                    {dashboardData?.paymentMethods && Object.entries(dashboardData.paymentMethods).map(([method, count]) => {
                      const total = Object.values(dashboardData.paymentMethods).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                      
                      return (
                        <div key={method} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              method === "M-Pesa" ? "bg-green-100" :
                              method === "Visa" || method === "Mastercard" ? "bg-blue-100" :
                              method === "Airtel Money" ? "bg-red-100" : "bg-neutral-100"
                            }`}>
                              <i className={`fas ${
                                method === "M-Pesa" ? "fa-mobile-alt text-green-600" :
                                method === "Visa" || method === "Mastercard" ? "fa-credit-card text-blue-600" :
                                method === "Airtel Money" ? "fa-phone text-red-600" : "fa-question text-neutral-600"
                              }`}></i>
                            </div>
                            <span className="font-medium text-neutral-800">{method || "Unknown"}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-neutral-200 rounded-full">
                              <div 
                                className={`h-2 rounded-full ${
                                  method === "M-Pesa" ? "bg-green-500" :
                                  method === "Visa" || method === "Mastercard" ? "bg-blue-500" :
                                  method === "Airtel Money" ? "bg-red-500" : "bg-neutral-500"
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-neutral-600 w-10 text-right">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {dashboardData?.recentTransactions?.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          transaction.status === "COMPLETED" ? "bg-success/10" :
                          transaction.status === "PENDING" ? "bg-warning/10" : "bg-error/10"
                        }`}>
                          <i className={`fas text-sm ${
                            transaction.status === "COMPLETED" ? "fa-check text-success" :
                            transaction.status === "PENDING" ? "fa-clock text-warning" : "fa-times text-error"
                          }`}></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-800">
                            {transaction.type === "donation" ? "Donation Payment" : "Event Registration"}
                          </p>
                          <p className="text-xs text-neutral-500">
                            KES {transaction.amount} • {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transaction Table */}
            {transactions && <TransactionTable transactions={transactions} />}
          </div>
        </div>
      </div>
    </div>
  );
}
