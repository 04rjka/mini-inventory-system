from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Q
from django.shortcuts import get_object_or_404

from .models import Category, Product, SaleLog
from .serializers import CategorySerializer, ProductSerializer, SaleLogSerializer


# 1. Categories: List & Create
@api_view(['GET', 'POST'])
def category_list_create(request):
    if request.method == 'GET':
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 2. Products: List & Create (with Search & Filtering)
@api_view(['GET', 'POST'])
def product_list_create(request):
    if request.method == 'GET':
        queryset = Product.objects.all().order_by('-created_at')

        # Filter: Search query
        search_query = request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | Q(description__icontains=search_query)
            )

        # Filter: Category ID
        category_id = request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Filter: Price Range
        min_price = request.query_params.get('min_price', None)
        max_price = request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        serializer = ProductSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 3. Product Detail: Retrieve, Update, Delete
@api_view(['GET', 'PUT', 'DELETE'])
def product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk)

    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        product.delete()
        return Response({'message': 'Product deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# 4. Sales: List & Create
@api_view(['GET', 'POST'])
def sale_list_create(request):
    if request.method == 'GET':
        sales = SaleLog.objects.all().order_by('-sale_date')
        serializer = SaleLogSerializer(sales, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = SaleLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 5. Dashboard Summary Analytics
@api_view(['GET'])
def dashboard_summary(request):
    total_products = Product.objects.count()
    total_stock = Product.objects.aggregate(total=Sum('stock_quantity'))['total'] or 0
    total_sales_count = SaleLog.objects.aggregate(total=Sum('quantity_sold'))['total'] or 0
    total_revenue = SaleLog.objects.aggregate(total=Sum('total_amount'))['total'] or 0.0

    low_stock_products = ProductSerializer(
        Product.objects.filter(stock_quantity__lt=5), many=True
    ).data

    return Response({
        "total_products": total_products,
        "total_stock": total_stock,
        "total_sales_count": total_sales_count,
        "total_revenue": total_revenue,
        "low_stock_products": low_stock_products
    }, status=status.HTTP_200_OK)