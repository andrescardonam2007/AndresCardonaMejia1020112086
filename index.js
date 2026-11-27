'use strict';

// Menú de consola para usar el CRUD de productos.
// Se ejecuta con:  npm start
// La lógica del CRUD está en src/productos.js; este archivo solo pide datos y muestra resultados.

const readline = require('node:readline');
const { RegistroProductos, ErrorValidacion, ErrorNoEncontrado } = require('./src/productos');

const registro = new RegistroProductos();
const consola = readline.createInterface({ input: process.stdin, output: process.stdout });
const lineas = consola[Symbol.asyncIterator]();
let entradaAbierta = true;

const MENU = `
===== REGISTRO DE PRODUCTOS =====
1. Listar productos
2. Buscar producto por id
3. Crear producto
4. Actualizar producto
5. Eliminar producto
6. Buscar productos por nombre
0. Salir`;

async function preguntarTexto(etiqueta) {
  consola.setPrompt(`${etiqueta}: `);
  consola.prompt();
  const { value, done } = await lineas.next();
  if (done) {
    entradaAbierta = false; // se cerró la entrada (por ejemplo con Ctrl + C)
    return '';
  }
  return value.trim();
}

async function preguntarNumero(etiqueta) {
  const respuesta = await preguntarTexto(etiqueta);
  return respuesta === '' ? Number.NaN : Number(respuesta);
}

function mostrar(productos, mensajeSiVacio = 'No hay productos registrados.') {
  if (productos.length === 0) {
    console.log(mensajeSiVacio);
    return;
  }
  console.table(productos);
}

async function listar() {
  mostrar(registro.listar());
}

async function buscar() {
  const id = await preguntarNumero('Id del producto');
  mostrar([registro.obtenerPorId(id)]);
}

async function crear() {
  const producto = registro.crear({
    nombre: await preguntarTexto('Nombre'),
    descripcion: await preguntarTexto('Descripción'),
    precio: await preguntarNumero('Precio'),
    cantidad: await preguntarNumero('Cantidad'),
  });
  console.log(`Producto creado con id ${producto.id}.`);
  mostrar([producto]);
}

async function actualizar() {
  const id = await preguntarNumero('Id del producto a actualizar');
  const actual = registro.obtenerPorId(id);
  console.log('Presiona Enter para dejar un campo como está.');

  const nombre = await preguntarTexto(`Nombre [${actual.nombre}]`);
  const descripcion = await preguntarTexto(`Descripción [${actual.descripcion}]`);
  const precio = await preguntarTexto(`Precio [${actual.precio}]`);
  const cantidad = await preguntarTexto(`Cantidad [${actual.cantidad}]`);

  const actualizado = registro.actualizar(id, {
    nombre: nombre || actual.nombre,
    descripcion: descripcion || actual.descripcion,
    precio: precio === '' ? actual.precio : Number(precio),
    cantidad: cantidad === '' ? actual.cantidad : Number(cantidad),
  });
  console.log('Producto actualizado.');
  mostrar([actualizado]);
}

async function eliminar() {
  const id = await preguntarNumero('Id del producto a eliminar');
  const eliminado = registro.eliminar(id);
  console.log(`Producto eliminado: ${eliminado.nombre}.`);
}

async function buscarPorNombre() {
  const texto = await preguntarTexto('Texto a buscar en el nombre');
  mostrar(registro.buscarPorNombre(texto), 'Ningún producto coincide con la búsqueda.');
}

const OPCIONES = new Map([
  ['1', listar],
  ['2', buscar],
  ['3', crear],
  ['4', actualizar],
  ['5', eliminar],
  ['6', buscarPorNombre],
]);

async function ejecutar(opcion) {
  const accion = OPCIONES.get(opcion);
  if (!accion) {
    console.log(`Opción no válida. Escribe un número del 0 al ${OPCIONES.size}.`);
    return;
  }
  try {
    await accion();
  } catch (error) {
    if (error instanceof ErrorValidacion || error instanceof ErrorNoEncontrado) {
      console.log(`Error: ${error.message}`);
      return;
    }
    throw error;
  }
}

async function main() {
  let opcion = '';
  while (opcion !== '0' && entradaAbierta) {
    console.log(MENU);
    opcion = await preguntarTexto('Elige una opción');
    if (opcion !== '0' && entradaAbierta) {
      await ejecutar(opcion);
    }
  }
  console.log('\nHasta pronto.');
  consola.close();
}

main().catch((error) => {
  console.error(error);
  consola.close();
  process.exitCode = 1;
});
