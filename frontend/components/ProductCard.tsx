'use client';

import Link from 'next/link';
import { Product } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    onDelete: (id: number) => void;
}

const API_ORIGIN = new URL(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api'
).origin;

export default function ProductCard({ product, onDelete }: ProductCardProps) {
    const imageUrl = product.image
        ? product.image.startsWith('http')
            ? product.image
            : `${API_ORIGIN}${product.image}`
        : null;

    return (
        <Card className="flex flex-col justify-between overflow-hidden">
            <CardHeader className="p-0 relative">
                <Badge
                    variant="secondary"
                    className="absolute top-3 left-3 z-10 font-mono text-xs shadow-sm bg-background/80 backdrop-blur-sm"
                >
                    #{product.id}
                </Badge>
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                    />
                )}
            </CardHeader>
            <CardContent className="p-5 space-y-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{product.title}</CardTitle>
                    <span className="text-lg font-bold text-primary">${product.price}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description || 'No description available.'}
                </p>
                <div className="flex justify-between items-center pt-2">
                    <Badge variant="secondary">
                        {product.category_detail?.name || 'Uncategorized'}
                    </Badge>
                    <Badge variant={product.stock_quantity < 5 ? 'destructive' : 'outline'}>
                        Stock: {product.stock_quantity}
                    </Badge>
                </div>
            </CardContent>

            <CardFooter className="bg-muted/50 px-5 py-3 flex justify-between items-center border-t">
                <Link
                    href={`/products/${product.id}/sales`}
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                    <ShoppingCart className="mr-1.5 h-4 w-4" /> Log Sale
                </Link>
                <div className="flex gap-1">
                    <Link
                        href={`/products/${product.id}/edit`}
                        className={buttonVariants({ variant: 'ghost', size: 'icon' })}
                    >
                        <Edit className="h-4 w-4" />
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}