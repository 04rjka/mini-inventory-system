'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, Product, SaleLog } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

export default function SalesPage() {
  const [sales, setSales] = useState<SaleLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/sales/'), api.get('/products/')])
      .then(([salesRes, prodRes]) => {
        setSales(salesRes.data);
        setProducts(prodRes.data);
      })
      .catch((err) => console.error('Failed to load sales:', err))
      .finally(() => setLoading(false));
  }, []);

  const titleOf = (id: number) =>
    products.find((p) => p.id === id)?.title ?? `Product #${id}`;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Sales ({sales.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Log ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Total ($)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No sales logged yet.
                </TableCell>
              </TableRow>
            ) : (
              sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">#{s.id}</TableCell>
                  <TableCell>
                    <Link href={`/products/${s.product}/sales`} className="hover:underline">
                      {titleOf(s.product)}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(s.sale_date).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center font-semibold">{s.quantity_sold}</TableCell>
                  <TableCell className="text-right font-bold">${s.total_amount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}