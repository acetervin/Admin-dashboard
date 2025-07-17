import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Donations",
      value: `KES ${stats.totalDonations.toLocaleString()}`,
      change: "+12.5% from last month",
      changeType: "positive" as const,
      icon: "fas fa-heart",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Event Registrations", 
      value: stats.monthlyStats.totalTransactions.toString(),
      change: "+8.3% from last month",
      changeType: "positive" as const,
      icon: "fas fa-calendar",
      iconBg: "bg-secondary/10", 
      iconColor: "text-secondary",
    },
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      change: "Pesapal Integration",
      changeType: "neutral" as const,
      icon: "fas fa-check-circle",
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments.toString(),
      change: "Requires attention",
      changeType: "warning" as const, 
      icon: "fas fa-hourglass-half",
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-neutral-600 mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold text-neutral-800 mb-1">{card.value}</h3>
                <p className={`text-xs flex items-center ${
                  card.changeType === "positive" ? "text-success" :
                  card.changeType === "warning" ? "text-warning" :
                  card.changeType === "negative" ? "text-error" : "text-neutral-500"
                }`}>
                  {card.changeType === "positive" && <i className="fas fa-arrow-up text-xs mr-1"></i>}
                  {card.changeType === "warning" && <i className="fas fa-clock text-xs mr-1"></i>}
                  {card.changeType === "neutral" && <i className="fas fa-check text-xs mr-1"></i>}
                  {card.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <i className={`${card.icon} ${card.iconColor} text-xl`}></i>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
