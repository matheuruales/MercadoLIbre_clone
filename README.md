# Proyecto HTML/CSS/JS con Arquitectura 4 Capas (Dominio)

Base mínima y escalable para proyectos frontend sin frameworks. La estructura sigue 4 capas basadas en dominio y separa responsabilidades con reglas claras de dependencia.

## Estructura de carpetas

```
.
├── index.html
└── src
    ├── presentation
    │   ├── assets
    │   ├── components
    │   ├── layouts
    │   ├── pages
    │   ├── scripts
    │   │   └── main.js
    │   └── styles
    │       └── main.css
    ├── application
    │   ├── dto
    │   ├── ports
    │   ├── services
    │   └── use-cases
    ├── domain
    │   ├── entities
    │   ├── events
    │   ├── repositories
    │   ├── services
    │   └── value-objects
    └── infrastructure
        ├── api
        ├── config
        ├── mappers
        ├── repositories
        └── storage
```

## Capas y responsabilidades

- `presentation`: UI, estilos, interacción con el usuario y rendering. No contiene reglas de negocio.
- `application`: casos de uso, orquestación y puertos (interfaces) hacia infraestructura.
- `domain`: núcleo del negocio (entidades, servicios de dominio, eventos, value objects).
- `infrastructure`: implementaciones técnicas (API, almacenamiento, mappers). Depende de `application` y `domain`.

## Reglas de dependencia (estrictas)

- `presentation` → puede depender de `application`.
- `application` → puede depender de `domain`.
- `domain` → no depende de ninguna otra capa.
- `infrastructure` → depende de `application` y `domain`, nunca al revés.

## Escalabilidad modular (por dominio/feature)

Cuando el proyecto crezca, organiza por dominios/feature dentro de cada capa.

Ejemplo:

```
src/domain/ventas/...
src/application/ventas/...
src/presentation/ventas/...
src/infrastructure/ventas/...
```

## Uso rápido

1. Abre `index.html` en el navegador, o sirve el directorio con un servidor local.
2. Modifica `src/presentation/styles/main.css` y `src/presentation/scripts/main.js` para empezar.

## Notas

- No hay build tools ni dependencias.
- El archivo `index.html` es el punto de entrada y carga CSS/JS desde `src/presentation`.
# MercadoLIbre_clone
