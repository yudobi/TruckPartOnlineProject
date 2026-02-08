"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions

# Importar la vista de esquema personalizada
from .schema import schema_view

# Decoradores para agrupar endpoints
from drf_yasg.utils import swagger_auto_schema
from functools import wraps

# Decorador personalizado para etiquetar vistas
def tag_view(tag_name):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(*args, **kwargs):
            return view_func(*args, **kwargs)
        _wrapped_view.__swagger_auto_schema = getattr(
            view_func, '__swagger_auto_schema', {})
        if not hasattr(_wrapped_view.__swagger_auto_schema, 'get'):
            _wrapped_view.__swagger_auto_schema = {}
        _wrapped_view.__swagger_auto_schema.setdefault('tags', [tag_name])
        return _wrapped_view
    return decorator

# Aplicar etiquetas a las vistas importadas
def apply_tag(tag_name, urlpatterns):
    for pattern in urlpatterns:
        if hasattr(pattern, 'url_patterns'):
            # Es un include
            apply_tag(tag_name, pattern.url_patterns)
        elif hasattr(pattern.callback, 'cls'):
            # Es una vista basada en clase
            view_class = pattern.callback.cls
            for method in ['get', 'post', 'put', 'patch', 'delete']:
                if hasattr(view_class, method):
                    method_handler = getattr(view_class, method)
                    setattr(view_class, method, tag_view(tag_name)(method_handler))
        elif hasattr(pattern, 'callback'):
            # Es una vista basada en función
            pattern.callback = tag_view(tag_name)(pattern.callback)
    return urlpatterns

# Importar los patrones de URL de las aplicaciones
from users import urls as users_urls
from orders import urls as orders_urls
from qb import urls as qb_urls
from inventory import urls as inventory_urls
from products import urls as products_urls

# Aplicar etiquetas a los patrones de URL
users_urls.urlpatterns = apply_tag('Usuarios', users_urls.urlpatterns)
orders_urls.urlpatterns = apply_tag('Órdenes', orders_urls.urlpatterns)
qb_urls.urlpatterns = apply_tag('QuickBooks', qb_urls.urlpatterns)
inventory_urls.urlpatterns = apply_tag('Inventario', inventory_urls.urlpatterns)
products_urls.urlpatterns = apply_tag('Productos', products_urls.urlpatterns)

urlpatterns = [
    # URLs de administración
    path('admin/', admin.site.urls),
    
    # Documentación de la API
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', 
            schema_view.without_ui(cache_timeout=0), 
            name='schema-json'),
    path('swagger/', 
         schema_view.with_ui('swagger', cache_timeout=0), 
         name='schema-swagger-ui'),
    path('redoc/', 
         schema_view.with_ui('redoc', cache_timeout=0), 
         name='schema-redoc'),
    
    # URLs de las aplicaciones (agrupadas por etiquetas)
    path('api/users/', include(users_urls)),
    path('api/', include(orders_urls)),
    path('api/qb/', include(qb_urls)),
    path('api/', include(inventory_urls)),
    path('api/', include(products_urls)),
]

# Servir archivos de medios en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
