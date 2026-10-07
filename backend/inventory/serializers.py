from rest_framework import serializers
from .models import Category, Product, SaleLog

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class ProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'category', 'category_detail',
            'price', 'stock_quantity', 'image', 'created_at', 'updated_at'
        ]

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock quantity cannot be negative.")
        return value


class SaleLogSerializer(serializers.ModelSerializer):
    product_title = serializers.ReadOnlyField(source='product.title')

    class Meta:
        model = SaleLog
        fields = ['id', 'product', 'product_title', 'quantity_sold', 'total_amount', 'sale_date']
        read_only_fields = ['total_amount']

    def create(self, validated_data):
        product = validated_data['product']
        quantity = validated_data['quantity_sold']

        # Validate stock availability
        if product.stock_quantity < quantity:
            raise serializers.ValidationError(
                {"quantity_sold": f"Insufficient stock. Available: {product.stock_quantity}"}
            )

        # Calculate total price automatically
        validated_data['total_amount'] = product.price * quantity

        # Decrement product stock
        product.stock_quantity -= quantity
        product.save()

        return super().create(validated_data)