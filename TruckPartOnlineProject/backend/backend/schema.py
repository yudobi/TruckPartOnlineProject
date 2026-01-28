"""
Configuración personalizada del esquema de documentación de la API de TruckPartOnline.

Este módulo configura la documentación interactiva de la API utilizando drf-yasg,
proporcionando una interfaz Swagger/OpenAPI para explorar y probar los endpoints.
"""
from drf_yasg import openapi
from drf_yasg.generators import OpenAPISchemaGenerator
from drf_yasg.views import get_schema_view
from rest_framework import permissions

# Definición de esquemas de respuesta comunes
RESPONSES = {
    'UNAUTHORIZED': openapi.Response(
        description='No autenticado',
        schema=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'detail': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    example='Las credenciales de autenticación no se proveyeron.'
                )
            }
        )
    ),
    'FORBIDDEN': openapi.Response(
        description='Acceso denegado',
        schema=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'detail': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    example='No tiene permiso para realizar esta acción.'
                )
            }
        )
    ),
    'NOT_FOUND': openapi.Response(
        description='Recurso no encontrado',
        schema=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'detail': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    example='No se encontró el recurso solicitado.'
                )
            }
        )
    )
}

# Configuración de seguridad
SECURITY_DEFINITIONS = {
    'Bearer': {
        'type': 'apiKey',
        'name': 'Authorization',
        'in': 'header',
        'description': 'Token de autenticación JWT. Ejemplo: Bearer {token}'
    }
}


class CustomOpenAPISchemaGenerator(OpenAPISchemaGenerator):
    """
    Generador personalizado de esquema OpenAPI para la documentación de la API.
    
    Extiende el generador por defecto para incluir información adicional
    y organizar mejor los endpoints en la documentación.
    """
    def get_operation(self, view, path, prefix, method, components, request):
        operation = super().get_operation(view, path, prefix, method, components, request)
        
        # Obtener la ruta completa de la URL
        full_path = (prefix or '') + path
        
        # Mapear patrones de URL a etiquetas
        if 'inventory' in full_path:
            operation.tags = ['Inventario']
        elif 'product' in full_path or 'categor' in full_path or 'brand' in full_path:
            operation.tags = ['Catálogo']
        elif 'order' in full_path or 'cart' in full_path:
            operation.tags = ['Órdenes']
        elif 'user' in full_path or 'auth' in full_path or 'login' in full_path or 'register' in full_path:
            operation.tags = ['Autenticación']
        elif 'customer' in full_path or 'client' in full_path or 'address' in full_path:
            operation.tags = ['Clientes']
        elif 'billing' in full_path or 'invoice' in full_path or 'payment' in full_path:
            operation.tags = ['Facturación']
        elif 'report' in full_path or 'analytics' in full_path:
            operation.tags = ['Reportes']
        elif 'quickbooks' in full_path or 'integration' in full_path:
            operation.tags = ['Integraciones']
        else:
            # Etiqueta por defecto si no hay coincidencia
            operation.tags = ['Otros']
        
        return operation
        
    def get_schema(self, request=None, public=False):
        schema = super().get_schema(request, public)
        
        # Definir tags para agrupar los endpoints
        schema.tags = [
            {
                "name": "Autenticación",
                "description": "Endpoints para registro, autenticación y gestión de usuarios"
            },
            {
                "name": "Inventario",
                "description": "Gestión de existencias, movimientos y seguimiento de inventario"
            },
            {
                "name": "Catálogo",
                "description": "Gestión de productos, categorías y características"
            },
            {
                "name": "Órdenes",
                "description": "Creación, seguimiento y gestión de pedidos"
            },
        ]
        
        # Agregar esquemas de respuesta comunes
        if not hasattr(schema, 'components'):
            schema.components = openapi.Schema(type=openapi.TYPE_OBJECT)
        
        if not hasattr(schema.components, 'responses'):
            schema.components.responses = {}
            
        # Agregar respuestas comunes
        schema.components.responses.update({
            'UnauthorizedError': {
                'description': 'Token inválido o no proporcionado',
                'content': {
                    'application/json': {
                        'schema': {
                            '$ref': '#/components/schemas/ErrorResponse'
                        },
                        'example': {
                            'detail': 'Las credenciales de autenticación no se proveyeron o son inválidas.'
                        }
                    }
                }
            },
            'ForbiddenError': {
                'description': 'No tiene permisos para realizar esta acción',
                'content': {
                    'application/json': {
                        'schema': {
                            '$ref': '#/components/schemas/ErrorResponse'
                        },
                        'example': {
                            'detail': 'No tiene permiso para realizar esta acción.'
                        }
                    }
                }
            },
            'NotFoundError': {
                'description': 'El recurso solicitado no fue encontrado',
                'content': {
                    'application/json': {
                        'schema': {
                            '$ref': '#/components/schemas/ErrorResponse'
                        },
                        'example': {
                            'detail': 'No se encontró el recurso solicitado.'
                        }
                    }
                }
            },
            'ValidationError': {
                'description': 'Error de validación en los datos enviados',
                'content': {
                    'application/json': {
                        'schema': {
                            '$ref': '#/components/schemas/ValidationError'
                        },
                        'example': {
                            'field_name': ['Este campo es requerido.']
                        }
                    }
                }
            }
        })
        
        # Agregar esquemas de componentes reutilizables
        if not hasattr(schema.components, 'schemas'):
            schema.components.schemas = {}
            
        schema.components.schemas.update({
            'ErrorResponse': {
                'type': 'object',
                'properties': {
                    'detail': {
                        'type': 'string',
                        'description': 'Mensaje de error descriptivo'
                    },
                    'code': {
                        'type': 'string',
                        'description': 'Código de error opcional para manejo programático'
                    }
                },
                'required': ['detail']
            },
            'ValidationError': {
                'type': 'object',
                'description': 'Errores de validación en los datos enviados',
                'additionalProperties': {
                    'type': 'array',
                    'items': {'type': 'string'}
                },
                'example': {
                    'campo': [
                        'Este campo es requerido.',
                        'Asegúrese de que este campo no tenga más de 100 caracteres.'
                    ]
                }
            },
            'PaginatedResponse': {
                'type': 'object',
                'properties': {
                    'count': {
                        'type': 'integer',
                        'description': 'Número total de elementos',
                        'example': 42
                    },
                    'next': {
                        'type': 'string',
                        'format': 'uri',
                        'nullable': True,
                        'description': 'URL de la siguiente página de resultados',
                        'example': 'http://api.example.com/items/?page=2'
                    },
                    'previous': {
                        'type': 'string',
                        'format': 'uri',
                        'nullable': True,
                        'description': 'URL de la página anterior de resultados',
                        'example': None
                    },
                    'results': {
                        'type': 'array',
                        'description': 'Lista de elementos',
                        'items': {}
                    }
                },
                'required': ['count', 'results']
            }
        })
        
        # Asegurarse de que todas las rutas tengan etiquetas
        if hasattr(schema, 'paths'):
            for path_item in schema.paths.values():
                for method, operation in path_item.items():
                    if not hasattr(operation, 'tags') or not operation.tags:
                        if hasattr(operation, 'operation_id'):
                            operation.tags = ['Otros']
        
        # Agregar parámetros comunes
        if not hasattr(schema.components, 'parameters'):
            schema.components.parameters = {}
            
        schema.components.parameters.update({
            'page': {
                'name': 'page',
                'in': 'query',
                'description': 'Un número de página dentro del conjunto de resultados paginados.',
                'required': False,
                'schema': {
                    'type': 'integer',
                    'default': 1,
                    'minimum': 1
                }
            },
            'page_size': {
                'name': 'page_size',
                'in': 'query',
                'description': 'Número de resultados a devolver por página.',
                'required': False,
                'schema': {
                    'type': 'integer',
                    'default': 20,
                    'minimum': 1,
                    'maximum': 100
                }
            },
            'search': {
                'name': 'search',
                'in': 'query',
                'description': 'Término de búsqueda para filtrar resultados.',
                'required': False,
                'schema': {
                    'type': 'string'
                }
            },
            'ordering': {
                'name': 'ordering',
                'in': 'query',
                'description': 'Campo por el cual ordenar los resultados. Prefijar con - para orden descendente.',
                'required': False,
                'schema': {
                    'type': 'string'
                }
            }
        })
        
        return schema


# Configuración de la documentación de Swagger
swagger_info = openapi.Info(
    title="TruckPartOnline API",
    default_version='v1',
    description="""
    # Documentación de la API de TruckPartOnline
    
    Bienvenido a la documentación de la API de TruckPartOnline. Esta API permite interactuar con todos los recursos
    del sistema de gestión de inventario y ventas de repuestos para camiones.
    
    ## Autenticación
    
    La API utiliza autenticación por token JWT. Para autenticarse, incluya el token en el encabezado `Authorization`
    de la siguiente manera:
    
    ```
    Authorization: Bearer <token>
    ```
    
    ## Convenciones
    
    - Todos los endpoints devuelven respuestas en formato JSON
    - Las fechas se manejan en formato ISO 8601 (ej: `2023-01-01T12:00:00Z`)
    - Los códigos de estado HTTP siguen las convenciones REST estándar
    
    ## Códigos de estado comunes
    
    - `200 OK`: La solicitud se completó exitosamente
    - `201 Created`: Recurso creado exitosamente
    - `204 No Content`: Operación exitosa sin contenido para devolver
    - `400 Bad Request`: La solicitud es inválida
    - `401 Unauthorized`: Se requiere autenticación
    - `403 Forbidden`: No tiene permisos para realizar esta acción
    - `404 Not Found`: El recurso solicitado no existe
    - `429 Too Many Requests`: Se ha excedido el límite de tasa
    - `500 Internal Server Error`: Error interno del servidor
    
    ## Paginación
    
    Los endpoints que devuelven listas de recursos utilizan paginación. La respuesta incluirá los siguientes campos:
    
    - `count`: Número total de elementos
    - `next`: URL de la siguiente página (null si es la última)
    - `previous`: URL de la página anterior (null si es la primera)
    - `results`: Array con los elementos de la página actual
    
    ## Ordenamiento
    
    Muchos endpoints soportan ordenamiento mediante el parámetro `ordering`. Para ordenar por un campo en orden
    descendente, prefije el nombre del campo con un guión (`-`).
    
    Ejemplo: `?ordering=-fecha_creacion`
    
    ## Búsqueda
    
    Los endpoints que soportan búsqueda utilizan el parámetro `search`.
    
    ## Filtrado
    
    Muchos endpoints permiten filtrar resultados utilizando parámetros de consulta. Los filtros disponibles
    se documentan en cada endpoint específico.
    
    ## Versión de la API
    
    La versión actual de la API es `v1`. Las versiones futuras mantendrán compatibilidad hacia atrás siempre que sea posible.
    """,
    terms_of_service="https://www.truckpartonline.com/terminos-y-condiciones/",
    contact=openapi.Contact(
        name="Soporte Técnico",
        email="soporte@truckpartonline.com",
        url="https://www.truckpartonline.com/contacto/"
    ),
    license=openapi.License(
        name="Licencia Propietaria",
        url="https://www.truckpartonline.com/licencia/"
    )
)

# Configuración del esquema de la API
schema_view = get_schema_view(
    swagger_info,
    public=True,
    permission_classes=[permissions.AllowAny],
    generator_class=CustomOpenAPISchemaGenerator,
)

# Configuración de la interfaz de usuario de Swagger
SWAGGER_SETTINGS = {
    'DEFAULT_INFO': swagger_info,
    'DEFAULT_MODEL_RENDERING': 'example',
    'DEFAULT_FIELD_INSPECTORS': [
        'drf_yasg.inspectors.CamelCaseJSONFilter',
        'drf_yasg.inspectors.ReferencingSerializerInspector',
        'drf_yasg.inspectors.RelatedFieldInspector',
        'drf_yasg.inspectors.ChoiceFieldInspector',
        'drf_yasg.inspectors.FileFieldInspector',
        'drf_yasg.inspectors.DictFieldInspector',
        'drf_yasg.inspectors.JSONFieldInspector',
        'drf_yasg.inspectors.HiddenFieldInspector',
        'drf_yasg.inspectors.RecursiveFieldInspector',
        'drf_yasg.inspectors.SerializerMethodFieldInspector',
        'drf_yasg.inspectors.SimpleFieldInspector',
        'drf_yasg.inspectors.StringDefaultFieldInspector',
    ],
    'DEFAULT_AUTO_SCHEMA_CLASS': 'drf_yasg.inspectors.SwaggerAutoSchema',
    'DEFAULT_GENERATOR_CLASS': 'drf_yasg.generators.OpenAPISchemaGenerator',
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'USE_SESSION_AUTH': True,
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'description': 'Token de autenticación JWT. Ejemplo: Bearer {token}'
        }
    },
    'REFETCH_SCHEMA_WITH_AUTH': True,
    'REFETCH_SCHEMA_ON_LOGOUT': True,
    'FETCH_SCHEMA_WITH_QUERY': True,
    'COMPONENT_SPLIT_REQUEST': True,
    'DEFAULT_MODEL_DEPTH': 2,
    'DEFAULT_FILTER_INSPECTORS': [
        'drf_yasg.inspectors.CoreAPICompatInspector',
    ],
    'DEFAULT_PAGINATOR_INSPECTORS': [
        'drf_yasg.inspectors.DjangoRestResponsePagination',
        'drf_yasg.inspectors.CoreAPICompatInspector',
    ],
    'DEFAULT_INFO': swagger_info,
    'DEFAULT_FILTER_INSPECTORS': [
        'drf_yasg.inspectors.CoreAPICompatInspector',
    ],
    'DEFAULT_PAGINATOR_INSPECTORS': [
        'drf_yasg.inspectors.DjangoRestResponsePagination',
        'drf_yasg.inspectors.CoreAPICompatInspector',
    ],
    'DEFAULT_AUTO_SCHEMA_CLASS': 'drf_yasg.inspectors.SwaggerAutoSchema',
    'DEFAULT_GENERATOR_CLASS': 'drf_yasg.generators.OpenAPISchemaGenerator',
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'USE_SESSION_AUTH': True,
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'description': 'Token de autenticación JWT. Ejemplo: Bearer {token}'
        }
    },
    'REFETCH_SCHEMA_WITH_AUTH': True,
    'REFETCH_SCHEMA_ON_LOGOUT': True,
    'FETCH_SCHEMA_WITH_QUERY': True,
    'COMPONENT_SPLIT_REQUEST': True,
    'DEFAULT_MODEL_DEPTH': 2,
}
