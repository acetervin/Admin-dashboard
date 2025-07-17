import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Transaction } from "@/types";

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions: initialTransactions }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter transactions based on search and status
  const filteredTransactions = initialTransactions?.filter((transaction) => {
    const matchesSearch = 
      transaction.pesapalMerchantReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Paginate results
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-success/10 text-success hover:bg-success/20">
            <i className="fas fa-check text-xs mr-1"></i>
            Completed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-warning/10 text-warning hover:bg-warning/20">
            <i className="fas fa-clock text-xs mr-1"></i>
            Pending
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-error/10 text-error hover:bg-error/20">
            <i className="fas fa-times text-xs mr-1"></i>
            Failed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-neutral-100 text-neutral-600 hover:bg-neutral-200">
            <i className="fas fa-ban text-xs mr-1"></i>
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    if (!method) return <i className="fas fa-question text-neutral-400"></i>;
    
    switch (method.toLowerCase()) {
      case "m-pesa":
      case "mpesa":
        return <i className="fas fa-mobile-alt text-green-600"></i>;
      case "airtel money":
      case "airtel":
        return <i className="fas fa-phone text-red-600"></i>;
      case "visa":
      case "mastercard":
      case "card":
        return <i className="fas fa-credit-card text-blue-600"></i>;
      default:
        return <i className="fas fa-credit-card text-neutral-400"></i>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "donation":
        return <i className="fas fa-heart text-primary"></i>;
      case "event_registration":
        return <i className="fas fa-calendar text-secondary"></i>;
      default:
        return <i className="fas fa-circle text-neutral-400"></i>;
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      ["Transaction ID", "Type", "Amount", "Status", "Customer", "Email", "Date"].join(","),
      ...filteredTransactions.map(t => [
        t.pesapalMerchantReference,
        t.type,
        t.amount,
        t.status,
        t.customerName,
        t.customerEmail,
        new Date(t.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">Recent Transactions</h3>
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 w-64"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"></i>
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Export Button */}
            <Button onClick={exportTransactions} className="bg-primary hover:bg-primary/90">
              <i className="fas fa-download mr-2"></i>
              Export
            </Button>
          </div>
        </div>
      </div>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50">
                <TableHead className="font-medium text-neutral-700">Transaction ID</TableHead>
                <TableHead className="font-medium text-neutral-700">Type</TableHead>
                <TableHead className="font-medium text-neutral-700">Amount</TableHead>
                <TableHead className="font-medium text-neutral-700">Payment Method</TableHead>
                <TableHead className="font-medium text-neutral-700">Status</TableHead>
                <TableHead className="font-medium text-neutral-700">Customer</TableHead>
                <TableHead className="font-medium text-neutral-700">Date</TableHead>
                <TableHead className="font-medium text-neutral-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <i className="fas fa-search text-neutral-400 text-2xl"></i>
                      <p className="text-neutral-500">No transactions found</p>
                      {searchTerm && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSearchTerm("")}
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-neutral-50">
                    <TableCell>
                      <span className="font-mono text-sm text-neutral-800">
                        {transaction.pesapalMerchantReference}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(transaction.type)}
                        <span className="text-sm capitalize">
                          {transaction.type.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-neutral-800">
                        KES {Number(transaction.amount).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                        <span className="text-sm">
                          {transaction.paymentMethod || "Pending"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-neutral-800">
                          {transaction.customerName}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {transaction.customerEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-neutral-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-primary hover:text-primary/80"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-primary text-white" : ""}
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="text-neutral-400">...</span>;
                  }
                  return null;
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
