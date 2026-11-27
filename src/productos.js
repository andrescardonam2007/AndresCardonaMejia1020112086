'use strict';

// Lógica del CRUD de productos.
// Los productos se guardan en un archivo JSON con esta forma:
//   { "ultimoId": 2, "productos": [ { "id": 1, ... }, { "id": 2, ... } ] }

const fs = require('node:fs');
const path = require('node:path');

const RUTA_POR_DEFECTO = path.join(__dirname, '..', 'data', 'productos.json');
const CAMPOS = ['nombre', 'descripcion', 'precio', 'cantidad'];

/** Error que se lanza cuando los datos de un producto no son válidos. */
class ErrorValidacion extends Error {
  constructor(errores) {
    super(errores.join(' '));
    this.name = 'ErrorValidacion';
    this.errores = errores;
  }
}

/** Error que se lanza cuando no existe un producto con el id indicado. */
class ErrorNoEncontrado extends Error {
  constructor(id) {
    super(`No existe un producto con id ${id}.`);
    this.name = 'ErrorNoEncontrado';
    this.id = id;
  }
}

function esTextoConContenido(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

/**
 * Revisa los datos de un producto y los devuelve limpios.
 * Si algún campo no cumple las reglas, lanza ErrorValidacion.
 */
function validarProducto(datos) {
  const errores = [];

  if (!esTextoConContenido(datos.nombre)) {
    errores.push('El nombre es obligatorio.');
  }
  if (!esTextoConContenido(datos.descripcion)) {
    errores.push('La descripción es obligatoria.');
  }
  if (typeof datos.precio !== 'number' || !Number.isFinite(datos.precio) || datos.precio <= 0) {
    errores.push('El precio debe ser un número mayor que 0.');
  }
  if (!Number.isInteger(datos.cantidad) || datos.cantidad < 0) {
    errores.push('La cantidad debe ser un número entero mayor o igual a 0.');
  }

  if (errores.length > 0) {
    throw new ErrorValidacion(errores);
  }

  return {
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion.trim(),
    precio: datos.precio,
    cantidad: datos.cantidad,
  };
}

class RegistroProductos {
  #rutaArchivo;

  /** @param {string} rutaArchivo Archivo JSON donde se guardan los productos. */
  constructor(rutaArchivo = RUTA_POR_DEFECTO) {
    this.#rutaArchivo = rutaArchivo;
  }

  #leerArchivo() {
    if (!fs.existsSync(this.#rutaArchivo)) {
      return { ultimoId: 0, productos: [] };
    }
    try {
      return JSON.parse(fs.readFileSync(this.#rutaArchivo, 'utf8'));
    } catch (error) {
      throw new Error(`El archivo ${this.#rutaArchivo} no contiene JSON válido.`, { cause: error });
    }
  }

  #guardarArchivo(registro) {
    fs.mkdirSync(path.dirname(this.#rutaArchivo), { recursive: true });
    fs.writeFileSync(this.#rutaArchivo, JSON.stringify(registro, null, 2), 'utf8');
  }

  /** CREAR: agrega un producto y le asigna un id único. */
  crear(datos) {
    const producto = validarProducto(datos);
    const registro = this.#leerArchivo();

    registro.ultimoId += 1; // el id nunca se repite, aunque se eliminen productos
    const nuevo = { id: registro.ultimoId, ...producto };
    registro.productos.push(nuevo);

    this.#guardarArchivo(registro);
    return nuevo;
  }

  /** LEER: devuelve todos los productos. */
  listar() {
    return this.#leerArchivo().productos;
  }

  /** LEER: devuelve un producto por su id. */
  obtenerPorId(id) {
    const producto = this.listar().find((p) => p.id === id);
    if (!producto) {
      throw new ErrorNoEncontrado(id);
    }
    return producto;
  }

  /** ACTUALIZAR: cambia uno o varios campos de un producto existente. */
  actualizar(id, cambios) {
    const registro = this.#leerArchivo();
    const indice = registro.productos.findIndex((p) => p.id === id);
    if (indice === -1) {
      throw new ErrorNoEncontrado(id);
    }

    const camposEnviados = CAMPOS.filter((campo) => cambios[campo] !== undefined);
    if (camposEnviados.length === 0) {
      throw new ErrorValidacion(['Debes enviar al menos un campo para actualizar.']);
    }

    const combinado = { ...registro.productos[indice] };
    for (const campo of camposEnviados) {
      combinado[campo] = cambios[campo];
    }

    const actualizado = { id, ...validarProducto(combinado) };
    registro.productos[indice] = actualizado;

    this.#guardarArchivo(registro);
    return actualizado;
  }

  /** ELIMINAR: borra un producto y devuelve el producto eliminado. */
  eliminar(id) {
    const registro = this.#leerArchivo();
    const indice = registro.productos.findIndex((p) => p.id === id);
    if (indice === -1) {
      throw new ErrorNoEncontrado(id);
    }

    const [eliminado] = registro.productos.splice(indice, 1);
    this.#guardarArchivo(registro);
    return eliminado;
  }
}

module.exports = { RegistroProductos, ErrorValidacion, ErrorNoEncontrado };
