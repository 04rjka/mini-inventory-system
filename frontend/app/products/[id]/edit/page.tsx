import { Suspense } from 'react';
import ProductEditForm from '@/components/ProductEditForm';
import { Loader2 } from 'lucide-react';

export default function ProductEditPage({
  params,
}: {
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
      <ProductEditForm params={params} />
    </Suspense>
  );
}