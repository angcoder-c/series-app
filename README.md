# Vanilla Series App

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

Aplicación full-stack para gestión de series. Backend construido con **FastAPI** y **PostgreSQL**, frontend desplegado en **Vercel** y API en **Railway**.

<div align="center">

[![Ver Frontend](https://img.shields.io/badge/%F0%9F%9A%80_Visitar_Frontend-000000?style=for-the-badge&logo=vercel)](https://series-app-omega.vercel.app/)
[![Ver API Docs](https://img.shields.io/badge/%F0%9F%93%96_API_Docs-009688?style=for-the-badge&logo=fastapi)](https://series-api-production.up.railway.app/docs)

</div>

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Backend | FastAPI, JWT Auth |
| Base de datos | PostgreSQL |
| Contenedores | Docker, Docker Compose |
| Frontend | Vercel |
| Deploy API | Railway |

## Estructura del proyecto

```
series-app/
├── series-api/
│   ├── main.py
│   └── src/
│       ├── api/         
│       ├── models/       
│       ├── repositories/ 
│       ├── services/     
│       ├── schemas/      # DTOs y esquemas 
│       └── utils/        # JWT, dependencias
├── db/
│   └── schema.sql
└── docker-compose.yml
```

## Requisitos

- Docker
- Docker Compose

## Levantar el entorno local

```bash
git clone --recurse-submodules https://github.com/angcoder-c/series-app.git
```

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Esto inicia:

| Servicio | Descripción |
|----------|-------------|
| `db` | PostgreSQL |
| `db-init` | Carga el esquema desde `db/schema.sql` |
| `api` | API FastAPI |
| `frontend` | Archivos HTML servidos por NGINX |

## URLs locales

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **API**: [http://localhost:8000](http://localhost:8000)
- **Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Producción

- **Frontend**: [series-app-omega.vercel.app](https://series-app-omega.vercel.app/)
- **API**: [series-api-production.up.railway.app](https://series-api-production.up.railway.app)
- **API Docs**: [series-api-production.up.railway.app/docs](https://series-api-production.up.railway.app/docs)
