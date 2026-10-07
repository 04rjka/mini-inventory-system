'use client';

import { useEffect, useState } from 'react';
import { api, DashboardSummary } from '@/lib/api';
import StatCard from '@/components/StatCard';
import { Package, DollarSign, ShoppingCart, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/summary/')
      .then((res) => setSummary(res.data))
      .catch((err) => console.error('Failed to load summary metrics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading metrics...
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Failed to load summary data.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time summary of your inventory and sales metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={summary.total_products} icon={Package} />
        <StatCard title="Total Revenue" value={`$${summary.total_revenue}`} icon={DollarSign} />
        <StatCard title="Total Items Sold" value={summary.total_sales_count} icon={ShoppingCart} />
        <StatCard title="Low Stock Warning" value={summary.low_stock_products.length} icon={AlertTriangle} />
      </div>

      {summary.low_stock_products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Low Stock Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Stock Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.low_stock_products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium text-foreground">
                      {product.title}
                    </TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="destructive">
                        {product.stock_quantity} left
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}