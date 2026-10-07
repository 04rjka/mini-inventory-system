from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.category_list_create, name='category-list-create'),
    path('products/', views.product_list_create, name='product-list-create'),
    path('products/<int:pk>/', views.product_detail, name='product-detail'),
    path('sales/', views.sale_list_create, name='sale-list-create'),
    path('dashboard/summary/', views.dashboard_summary, name='dashboard-summary'),
]