# TruckPart Online - Sistema de Rutas

## 📋 Descripción General

Este proyecto implementa un sistema de rutas declarativo utilizando **React Router 7**, con un layout básico que incluye Navbar, Footer y contenido principal.

## 🏗️ Estructura del Proyecto

```
src/
├── components/
│   └── layout/
│       ├── MainLayout.tsx    # Layout principal con Navbar y Footer
│       ├── Navbar.tsx         # Navegación superior
│       └── Footer.tsx         # Pie de página
├── pages/
│   ├── HomePage.tsx           # Página de inicio
│   ├── ProductsPage.tsx       # Catálogo de productos
│   ├── AboutPage.tsx          # Página acerca de
│   ├── ContactPage.tsx        # Formulario de contacto
│   └── NotFoundPage.tsx       # Página 404
├── routes/
│   └── index.tsx              # Configuración declarativa de rutas
└── main.tsx                   # Punto de entrada con Router Provider
```

## 🚀 Sistema de Rutas

### Configuración Declarativa

Las rutas están configuradas de forma declarativa en `src/routes/index.tsx` usando el array `RouteObject[]`:

```tsx
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
    ],
  },
];
```

### Rutas Disponibles

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `HomePage` | Página de inicio con hero y features |
| `/products` | `ProductsPage` | Catálogo de productos con filtros |
| `/about` | `AboutPage` | Información de la empresa |
| `/contact` | `ContactPage` | Formulario de contacto |
| `*` | `NotFoundPage` | Página 404 (opcional) |

## 🎨 Layout Principal

El layout está estructurado de la siguiente manera:

```tsx
<MainLayout>
  <Navbar />      {/* Navegación superior */}
  <main>
    <Outlet />    {/* Contenido de las rutas hijas */}
  </main>
  <Footer />      {/* Pie de página */}
</MainLayout>
```

## 📦 Componentes Principales

### Navbar
- Logo animado con gradiente
- Enlaces de navegación con efectos hover
- Responsive con menú móvil
- Ubicación: `src/components/layout/Navbar.tsx`

### Footer
- Información de la empresa
- Enlaces rápidos
- Datos de contacto
- Copyright dinámico
- Ubicación: `src/components/layout/Footer.tsx`

### MainLayout
- Estructura de página completa
- Sticky footer (siempre al final)
- Fondo con gradiente
- Ubicación: `src/components/layout/MainLayout.tsx`

## 🛠️ Agregar Nuevas Rutas

Para agregar una nueva ruta:

1. **Crea el componente de página** en `src/pages/`:

```tsx
// src/pages/MiNuevaPagina.tsx
export default function MiNuevaPagina() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1>Mi Nueva Página</h1>
    </div>
  );
}
```

2. **Importa y agrega la ruta** en `src/routes/index.tsx`:

```tsx
import MiNuevaPagina from '@/pages/MiNuevaPagina';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // ... rutas existentes
      {
        path: 'mi-nueva-ruta',
        element: <MiNuevaPagina />,
      },
    ],
  },
];
```

3. **Agrega el enlace** en `Navbar.tsx` (opcional):

```tsx
<NavLink to="/mi-nueva-ruta">Mi Nueva Ruta</NavLink>
```

## 🎯 Características de Diseño

- **Gradientes modernos**: Uso de gradientes en fondos y textos
- **Animaciones suaves**: Efectos hover y transiciones
- **Responsive**: Diseño adaptable a todos los dispositivos
- **Accesibilidad**: Estructura semántica HTML5
- **Tipografía**: Sistema de tipos consistente
- **Colores**: Paleta de colores azul/cyan con variantes slate

## 🧩 Rutas Anidadas

Para crear rutas anidadas dentro de una sección:

```tsx
{
  path: 'products',
  element: <ProductsLayout />,
  children: [
    { index: true, element: <ProductsList /> },
    { path: ':id', element: <ProductDetail /> },
    { path: ':id/reviews', element: <ProductReviews /> },
  ],
}
```

## 🔧 Configuración del Router

El router se configura en `main.tsx` usando `createBrowserRouter`:

```tsx
import { createBrowserRouter, RouterProvider } from "react-router";
import routes from "./routes";

const router = createBrowserRouter(routes);

<RouterProvider router={router} />
```

## 📱 Navegación Programática

Para navegar programáticamente dentro de componentes:

```tsx
import { useNavigate } from 'react-router';

function MiComponente() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/products');
  };
  
  return <button onClick={handleClick}>Ver Productos</button>;
}
```

## 🌐 Parámetros de Ruta

Para usar parámetros dinámicos:

```tsx
// En routes/index.tsx
{
  path: 'products/:id',
  element: <ProductDetail />,
}

// En el componente
import { useParams } from 'react-router';

function ProductDetail() {
  const { id } = useParams();
  return <div>Producto ID: {id}</div>;
}
```

## 💡 Buenas Prácticas

1. **Estructura consistente**: Mantén todos los archivos de página en `src/pages/`
2. **Lazy loading**: Para mejorar el rendimiento, usa lazy loading:

```tsx
import { lazy } from 'react';
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
```

3. **Protección de rutas**: Implementa guards para rutas privadas:

```tsx
{
  path: 'admin',
  element: <PrivateRoute><AdminPage /></PrivateRoute>,
}
```

4. **SEO**: Usa `react-helmet` o similar para meta tags dinámicos por ruta

## 🚀 Comandos

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 📚 Recursos

- [React Router 7 Docs](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

---

Desarrollado con ❤️ para TruckPart Online
