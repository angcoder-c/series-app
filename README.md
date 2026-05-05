# Series App

API en FastAPI con PostgreSQL, levantada con Docker Compose.

## Requisitos

- Docker
- Docker Compose

## Levantar el entorno

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Eso inicia:

- `db`: PostgreSQL
- `db-init`: carga el esquema desde `db/schema.sql`
- `api`: la API FastAPI

## Primer arranque

El esquema se ejecuta al crear el volumen por primera vez. Si ya existe un volumen previo y quieres aplicar el esquema de nuevo, elimina el volumen de datos y vuelve a levantar el stack.

## URLs útiles

- API: `http://localhost:8000`
- Docs Swagger: `http://localhost:8000/docs`
- Docs ReDoc: `http://localhost:8000/redoc`
