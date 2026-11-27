# CRUD de productos

Aplicación de consola para administrar un registro de productos con las cuatro
operaciones CRUD: crear, leer, actualizar y eliminar.

Taller de la Guía de Trabajo No. 5 · Aplicaciones y servicios web · ITM.

- **Lenguaje:** JavaScript (Node.js 22 o superior)
- **Almacenamiento:** archivo JSON (`data/productos.json`, se crea al guardar el primer producto)
- **Pruebas:** módulo de pruebas integrado de Node.js (`node:test`)
- **Dependencias externas:** ninguna (no hace falta `npm install`)

## Estructura

```
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
| Actualizar | `actualizar(id, cambios)` | `ErrorNoEncontrado` o `ErrorValidacion` |
| Eliminar | `eliminar(id)` | `ErrorNoEncontrado` si el id no existe |
