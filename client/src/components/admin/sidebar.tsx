import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/auth";

export default function AdminSidebar() {
  const [location] = useLocation();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      window.location.href = "/admin/login";
    },
  });

  const navItems = [
    {
      href: "/admin/dashboard",
      icon: "fas fa-tachometer-alt",
      label: "Dashboard",
      active: location === "/admin/dashboard",
    },
    {
      href: "/admin/transactions",
      icon: "fas fa-credit-card", 
      label: "Transactions",
      active: location === "/admin/transactions",
    },
    {
      href: "/admin/events",
      icon: "fas fa-calendar",
      label: "Event Registrations", 
      active: location === "/admin/events",
    },
    {
      href: "/admin/donations",
      icon: "fas fa-heart",
      label: "Donations",
      active: location === "/admin/donations", 
    },
    {
      href: "/admin/analytics",
      icon: "fas fa-chart-line",
      label: "Analytics",
      active: location === "/admin/analytics",
    },
    {
      href: "/admin/settings",
      icon: "fas fa-cog",
      label: "Settings",
      active: location === "/admin/settings",
    },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-neutral-200 min-h-screen">
      <div className="p-6">
        {/* Family Peace Foundation Logo */}
        <Link href="/admin/dashboard">
          <div className="flex items-center space-x-3 mb-8 cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-hand-holding-heart text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-800">Family Peace</h1>
              <p className="text-sm text-neutral-500">Foundation</p>
            </div>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                item.active 
                  ? "bg-primary text-white" 
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}>
                <i className={`${item.icon} text-lg`}></i>
                <span className="font-medium">{item.label}</span>
              </a>
            </Link>
          ))}
        </nav>
      </div>

      {/* Pesapal Integration Status */}
      <div className="px-6 py-4 border-t border-neutral-200">
        <div className="flex items-center space-x-2 text-sm mb-3">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span className="text-neutral-600">Pesapal Connected</span>
        </div>
        <p className="text-xs text-neutral-500 mb-4">API 3.0 Integration Active</p>
        
        {/* Logout Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <i className="fas fa-sign-out-alt mr-2"></i>
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
}
