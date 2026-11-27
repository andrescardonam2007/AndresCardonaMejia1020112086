'use strict';

// Pruebas unitarias del CRUD de productos.
// Cada operación tiene al menos un caso exitoso y un caso de error.
// Se ejecutan con:  npm test

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { RegistroProductos, ErrorValidacion, ErrorNoEncontrado } = require('../src/productos');

const TECLADO = {
  nombre: 'Teclado mecánico',
  descripcion: 'Teclado con switches rojos',
  precio: 180000,
  cantidad: 10,
};
const MOUSE = {
  nombre: 'Mouse inalámbrico',
  descripcion: 'Mouse óptico de 1600 DPI',
  precio: 65000,
  cantidad: 25,
};
const ID_INEXISTENTE = 999;

describe('CRUD de productos', () => {
  let carpetaTemporal;
  let rutaArchivo;
  let registro;

  // Cada prueba usa su propio archivo temporal, así no se afectan entre sí
  // ni tocan los datos reales de data/productos.json.
  beforeEach(() => {
    carpetaTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'crud-productos-'));
    rutaArchivo = path.join(carpetaTemporal, 'productos.json');
    registro = new RegistroProductos(rutaArchivo);
  });

  afterEach(() => {
    fs.rmSync(carpetaTemporal, { recursive: true, force: true });
  });

  describe('Crear', () => {
    it('éxito: crea un producto y le asigna un id', () => {
      const creado = registro.crear(TECLADO);

      assert.deepEqual(creado, { id: 1, ...TECLADO });
      assert.deepEqual(registro.listar(), [creado]);
    });

    it('éxito: cada producto recibe un id único, incluso después de eliminar', () => {
      const primero = registro.crear(TECLADO);
      const segundo = registro.crear(MOUSE);
      registro.eliminar(segundo.id);
      const tercero = registro.crear(MOUSE);

      assert.equal(primero.id, 1);
      assert.equal(segundo.id, 2);
      assert.equal(tercero.id, 3);
    });

    it('éxito: los datos quedan guardados en el archivo JSON', () => {
      const creado = registro.crear(TECLADO);

      const otroRegistro = new RegistroProductos(rutaArchivo);
      assert.deepEqual(otroRegistro.obtenerPorId(creado.id), creado);
    });

    it('error: rechaza un producto sin nombre', () => {
      assert.throws(() => registro.crear({ ...TECLADO, nombre: '   ' }), ErrorValidacion);
      assert.deepEqual(registro.listar(), []);
    });

    it('error: rechaza precio negativo y cantidad con decimales', () => {
      assert.throws(
        () => registro.crear({ ...TECLADO, precio: -5, cantidad: 2.5 }),
        (error) => {
          assert.ok(error instanceof ErrorValidacion);
          assert.equal(error.errores.length, 2);
          return true;
        },
      );
    });

    it('error: informa todos los campos que faltan', () => {
      assert.throws(
        () => registro.crear({}),
        (error) => {
          assert.ok(error instanceof ErrorValidacion);
          assert.equal(error.errores.length, 4);
          return true;
        },
      );
    });
  });

  describe('Leer', () => {
    it('éxito: lista vacía cuando todavía no hay productos', () => {
      assert.deepEqual(registro.listar(), []);
    });

    it('éxito: lista todos los productos creados', () => {
      const teclado = registro.crear(TECLADO);
      const mouse = registro.crear(MOUSE);

      assert.deepEqual(registro.listar(), [teclado, mouse]);
    });

    it('éxito: obtiene un producto por su id', () => {
      registro.crear(TECLADO);
      const mouse = registro.crear(MOUSE);

      assert.deepEqual(registro.obtenerPorId(mouse.id), mouse);
    });

    it('error: falla al buscar un producto que no existe', () => {
      registro.crear(TECLADO);

      assert.throws(() => registro.obtenerPorId(ID_INEXISTENTE), ErrorNoEncontrado);
    });

    it('error: falla si el archivo de datos está dañado', () => {
      fs.writeFileSync(rutaArchivo, 'esto no es JSON', 'utf8');

      assert.throws(() => registro.listar(), /no contiene JSON válido/);
    });
  });

  describe('Actualizar', () => {
    it('éxito: actualiza solo los campos enviados', () => {
      const creado = registro.crear(TECLADO);

      const actualizado = registro.actualizar(creado.id, { precio: 199900, cantidad: 8 });

      assert.deepEqual(actualizado, { ...creado, precio: 199900, cantidad: 8 });
      assert.deepEqual(registro.obtenerPorId(creado.id), actualizado);
    });

    it('error: falla al actualizar un producto que no existe', () => {
      assert.throws(() => registro.actualizar(ID_INEXISTENTE, { precio: 1000 }), ErrorNoEncontrado);
    });

    it('error: rechaza datos inválidos y conserva el producto original', () => {
      const creado = registro.crear(TECLADO);

      assert.throws(() => registro.actualizar(creado.id, { precio: 0 }), ErrorValidacion);
      assert.deepEqual(registro.obtenerPorId(creado.id), creado);
    });

    it('error: falla si no se envía ningún campo para cambiar', () => {
      const creado = registro.crear(TECLADO);

      assert.throws(() => registro.actualizar(creado.id, {}), ErrorValidacion);
    });
  });

  describe('Eliminar', () => {
    it('éxito: elimina el producto y deja los demás', () => {
      const teclado = registro.crear(TECLADO);
      const mouse = registro.crear(MOUSE);

      const eliminado = registro.eliminar(teclado.id);

      assert.deepEqual(eliminado, teclado);
      assert.deepEqual(registro.listar(), [mouse]);
    });

    it('error: falla al eliminar un producto que no existe', () => {
      const creado = registro.crear(TECLADO);

      assert.throws(() => registro.eliminar(ID_INEXISTENTE), ErrorNoEncontrado);
      assert.deepEqual(registro.listar(), [creado]);
    });
  });
});
