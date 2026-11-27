# CRUD de productos

[![CI/CD](https://github.com/andrescardonam2007/AndresCardonaMejia1020112086/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/andrescardonam2007/AndresCardonaMejia1020112086/actions/workflows/ci-cd.yml)

Aplicación de consola para administrar un registro de productos con las cuatro
operaciones CRUD: crear, leer, actualizar y eliminar.

Taller de la Guía de Trabajo No. 5 · Aplicaciones y servicios web · ITM.

- **Lenguaje:** JavaScript (Node.js 22 o superior)
- **Almacenamiento:** archivo JSON (`data/productos.json`, se crea al guardar el primer producto)
- **Pruebas:** módulo de pruebas integrado de Node.js (`node:test`)
- **Dependencias externas:** ninguna (no hace falta `npm install`)

## Estructura

```
├── .github/workflows/ci-cd.yml  # Flujo de CI/CD de GitHub Actions
├── index.js                  # Menú de consola para usar el CRUD
├── src/productos.js          # Lógica del CRUD y validaciones
├── test/productos.test.js    # Pruebas unitarias
└── package.json              # Scripts: start, test, coverage
```

## Cómo usarlo

```bash
npm start          # abre el menú de consola
npm test           # ejecuta las pruebas unitarias
npm run coverage   # ejecuta las pruebas y muestra la cobertura
```

## Producto

| Campo | Tipo | Regla |
|---|---|---|
| `id` | número | Único, lo asigna el sistema y nunca se repite |
| `nombre` | texto | Obligatorio |
| `descripcion` | texto | Obligatoria |
| `precio` | número | Mayor que 0 |
| `cantidad` | entero | Mayor o igual a 0 |

## Operaciones (`src/productos.js`)

| Operación | Método | Si falla |
|---|---|---|
| Crear | `crear(datos)` | `ErrorValidacion` si los datos no son válidos |
| Leer | `listar()` y `obtenerPorId(id)` | `ErrorNoEncontrado` si el id no existe |
| Buscar | `buscarPorNombre(texto)` | `ErrorValidacion` si el texto está vacío |
| Valor del inventario | `valorInventario()` | Error si el archivo de datos está dañado |
| Actualizar | `actualizar(id, cambios)` | `ErrorNoEncontrado` o `ErrorValidacion` |
| Eliminar | `eliminar(id)` | `ErrorNoEncontrado` si el id no existe |

## Integración y entrega continua (CI/CD)

El flujo `.github/workflows/ci-cd.yml` se ejecuta automáticamente en GitHub Actions
con cada push (y también se puede ejecutar a mano desde la pestaña **Actions**):

1. **Pruebas (CI):** descarga el código, instala Node.js 22, 24 y 26 en paralelo,
   ejecuta las pruebas unitarias con cobertura (mínimo 80 % de líneas) y prueba
   el menú de la aplicación.
2. **Entrega (CD):** si todas las pruebas pasan en la rama `main`, arma el paquete
   de la aplicación y lo publica como artefacto descargable (`crud-productos-vX.Y.Z`)
   en la página de la ejecución.

Si una prueba falla, la ejecución queda en rojo y no se genera el paquete.

## Historial de versiones

| Versión | Cambio |
|---|---|
| 1.0.0 | CRUD de productos con pruebas unitarias |
| 1.1.0 | Búsqueda de productos por nombre |
| 1.2.0 | Valor total del inventario |
