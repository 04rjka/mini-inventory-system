'use client';

import { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, Product, SaleLog } from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Plus, ArrowLeft, ExternalLink } from 'lucide-react';

function ProductSalesContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [sales, setSales] = useState<SaleLog[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/products/${productId}/`),
      api.get(`/sales/?product=${productId}`),
    ])
      .then(([prodRes, salesRes]) => {
        setProduct(prodRes.data);
        const logs = Array.isArray(salesRes.data)
          ? salesRes.data.filter((s: SaleLog) => s.product.toString() === productId)
          : [];
        setSales(logs);
      })
      .catch((err) => {
        console.error('Failed to load product sales:', err);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSubmitting(true);
    try {
      const res = await api.post('/sales/', {
        product: parseInt(productId),
        quantity_sold: quantity,
      });

      setSales([res.data, ...sales]);
      setQuantity(1);

      const prodRes = await api.get(`/products/${productId}/`);
      setProduct(prodRes.data);
    } catch (err: any) {
      alert(
        err.response?.data?.quantity_sold?.[0] ||
          err.response?.data?.detail ||
          'Failed to record sale log'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">Product not found.</p>
        <Button onClick={() => router.push('/products')}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-2 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {product.title}
            </h1>
            <Badge variant="outline" className="font-mono text-sm">
              #{product.id}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Sales logs and stock management for this product.
          </p>
        </div>

        <Link href="/sales">
          <Button variant="outline" size="sm">
            View All Global Sales Logs
          </Button>
        </Link>
      </div>

      {/* Record Sale & Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Product Stock Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-sm text-muted-foreground">Unit Price</span>
              <span className="font-semibold">${product.price}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-sm text-muted-foreground">Available Stock</span>
              <Badge
                variant={product.stock_quantity < 5 ? 'destructive' : 'default'}
              >
                {product.stock_quantity} units
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">Category</span>
              <span className="text-sm font-medium">
                {product.category_detail?.name || 'Uncategorized'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Record Product Sale</CardTitle>
            <CardDescription>
              Log a completed sale for #{product.id} — {product.title}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecordSale} className="flex gap-4 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Quantity Sold
                </label>
                <Input
                  type="number"
                  min="1"
                  max={product.stock_quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  placeholder="Qty"
                />
              </div>

              <Button type="submit" disabled={submitting || product.stock_quantity < 1}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Log Sale
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Single Product Sales Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales History ({sales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-center">Quantity Sold</TableHead>
                <TableHead className="text-right">Total Amount ($)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    No sale history logged yet for this product.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{s.id}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(s.sale_date).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {s.quantity_sold}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      ${s.total_amount}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProductSalesPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <ProductSalesContent {...props} />
    </Suspense>
  );
}