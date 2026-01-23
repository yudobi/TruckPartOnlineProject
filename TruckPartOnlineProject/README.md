# TruckPartOnlineProject

Este repositorio contiene el código fuente para el proyecto **TruckPartOnlineProject**, una plataforma integral de comercio electrónico para partes de camiones.

El proyecto está estructurado en tres componentes principales:

1.  **Backend**: API RESTful desarrollada en Django.
2.  **Admin**: Panel de administración desarrollado en React (Vite).
3.  **Store**: Tienda en línea para clientes desarrollada en React (Vite).

## Requisitos Previos

Asegúrate de tener instalados los siguientes programas en tu sistema:
- [Node.js](https://nodejs.org/) (versión LTS recomendada)
- [Python](https://www.python.org/) (versión 3.8 o superior)

## Estructura del Proyecto

```
TruckPartOnlineProject/
├── apps/
│   ├── admin/       # Frontend del Panel de Administración
│   └── store/       # Frontend de la Tienda Pública
└── backend/         # Backend Django API
```

## Guía de Instalación y Ejecución

Sigue estos pasos para poner en marcha cada componente del sistema. Se recomienda ejecutar cada componente en una terminal separada.

### 1. Backend (Django)

1.  Navega al directorio del backend:
    ```bash
    cd backend
    ```

2.  Capa y activa un entorno virtual (si no lo tienes creado):
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  Instala las dependencias necesarias:
    ```bash
    pip install -r requirements.txt
    ```

4.  Aplica las migraciones a la base de datos:
    ```bash
    python manage.py migrate
    ```

5.  Inicia el servidor de desarrollo:
    ```bash
    python manage.py runserver
    ```
    El servidor backend estará corriendo en `http://127.0.0.1:8000/`.

### 2. Frontend - Admin

1.  Navega al directorio de la aplicación admin desde la raíz del proyecto:
    ```bash
    cd apps/admin
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
    El panel de administración estará disponible en la URL indicada en la consola (por defecto suele ser `http://localhost:5173/`).

### 3. Frontend - Store

1.  Navega al directorio de la aplicación store desde la raíz del proyecto:
    ```bash
    cd apps/store
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
    La tienda estará disponible en la URL indicada en la consola.

## Configuración de Entorno (Environment Variables)

Para que el sistema funcione correctamente, es necesario configurar las variables de entorno en cada módulo.

### 1. Backend

Crea un archivo `.env` en el directorio `backend/` con el siguiente contenido (ajusta los valores según tu configuración):

```env
DATABASE_URL=sqlite:///db.sqlite3

# QuickBooks credentials
QB_CLIENT_ID=tu_client_id_aqui
QB_CLIENT_SECRET=tu_client_secret_aqui
QB_REDIRECT_URI=tu_redirect_uri_aqui
QB_ENVIRONMENT=sandbox
```

> **Nota:** `DATABASE_URL` utiliza SQLite por defecto. Para producción, cambia a PostgreSQL u otro gestor soportado por Django.

### 2. Frontend - Admin

En el directorio `apps/admin/`, encontrarás un archivo `.env.example`. Crea una copia de este archivo y renómbralo a `.env`.

Las variables principales son:

```env
# URL del backend
VITE_API_URL=http://localhost:8000/arye_system

# Modo de la aplicación
VITE_APP_MODE=development

# Configuración de Autenticación
VITE_AUTH_TOKEN_KEY=access_token
VITE_REFRESH_TOKEN_KEY=refresh_token
```

### 3. Frontend - Store

Actualmente, la configuración de la tienda sigue patrones similares. Si se requiere conexión a la API, asegúrate de definir `VITE_API_URL` en un archivo `.env` dentro de `apps/store/` apuntando a tu backend.

