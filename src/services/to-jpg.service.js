/**
 Como utilizar este servicio:

 import ConvertidorJPG from "./src/services/to-jpg.service.js";

const convertidor = new ConvertidorJPG();

// Convertir y guardar
const resultado = await convertidor.convertirAJPG(
  "./imagenes/original.png",
  "./imagenes/convertida.jpg",
  85 // calidad 0-100
);
 */
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

export class ConvertidorJPG {
  /**
   * Convierte una imagen en cualquier formato a JPG
   * @param {string} rutaImagen - Ruta de la imagen original
   * @param {string} rutaSalida - Ruta donde guardar el JPG (opcional)
   * @param {number} calidad - Calidad del JPG (1-100, default: 80)
   * @returns {Promise<{exito: boolean, ruta?: string, error?: string}>}
   */
  async convertirAJPG(rutaImagen, rutaSalida = null, calidad = 80) {
    try {
      // Validar que la imagen existe
      await fs.access(rutaImagen);

      // Si no se proporciona ruta de salida, crear una en la misma carpeta
      if (!rutaSalida) {
        const directorio = path.dirname(rutaImagen);
        const nombreArchivo = path.parse(rutaImagen).name;
        rutaSalida = path.join(directorio, `${nombreArchivo}.jpg`);
      }

      // Convertir a JPG
      await sharp(rutaImagen)
        .jpeg({ quality: calidad, progressive: true })
        .toFile(rutaSalida);

      return {
        exito: true,
        ruta: rutaSalida,
      };
    } catch (error) {
      return {
        exito: false,
        error: error.message,
      };
    }
  }

  /**
   * Convierte una imagen desde buffer a JPG
   * @param {Buffer} buffer - Buffer de la imagen original
   * @param {string} rutaSalida - Ruta donde guardar el JPG
   * @param {number} calidad - Calidad del JPG (1-100, default: 80)
   * @returns {Promise<{exito: boolean, ruta?: string, error?: string}>}
   */
  async convertirBufferAJPG(buffer, rutaSalida, calidad = 80) {
    try {
      await sharp(buffer)
        .jpeg({ quality: calidad, progressive: true })
        .toFile(rutaSalida);

      return {
        exito: true,
        ruta: rutaSalida,
      };
    } catch (error) {
      return {
        exito: false,
        error: error.message,
      };
    }
  }

  /**
   * Convierte una imagen y devuelve el buffer sin guardar a archivo
   * @param {string} rutaImagen - Ruta de la imagen original
   * @param {number} calidad - Calidad del JPG (1-100, default: 80)
   * @returns {Promise<{exito: boolean, buffer?: Buffer, error?: string}>}
   */
  async obtenerBufferJPG(rutaImagen, calidad = 80) {
    try {
      // Validar que la imagen existe
      await fs.access(rutaImagen);

      // Convertir a JPG y devolver buffer
      const buffer = await sharp(rutaImagen)
        .jpeg({ quality: calidad, progressive: true })
        .toBuffer();

      return {
        exito: true,
        buffer: buffer,
      };
    } catch (error) {
      return {
        exito: false,
        error: error.message,
      };
    }
  }
}

export default ConvertidorJPG;
