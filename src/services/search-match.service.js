import { ComparadorImagenes } from "../comparator.js";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BuscadorImagenesSimilares {
  constructor(directorioImagenes = "./imagenes", opciones = {}) {
    this.directorioImagenes = directorioImagenes;
    this.comparador = new ComparadorImagenes(opciones);
  }

  /**
   * Busca la imagen más parecida a la imagen proporcionada
   * @param {string} rutaImagenBusqueda - Ruta de la imagen a buscar
   * @returns {Promise<{exito: boolean, imagen?: string, similitud?: number, comparaciones?: Array, error?: string}>}
   */
  async encontrarImagenMasParecida(rutaImagenBusqueda) {
    try {
      // Validar que la imagen de búsqueda existe
      await fs.access(rutaImagenBusqueda);

      // Obtener lista de archivos en el directorio
      const archivos = await fs.readdir(this.directorioImagenes);

      // Filtrar solo imágenes (por extensión)
      const extensionesPermitidas = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".tiff",
      ];
      const imagenes = archivos.filter((archivo) => {
        const ext = path.extname(archivo).toLowerCase();
        return extensionesPermitidas.includes(ext);
      });

      if (imagenes.length === 0) {
        return {
          exito: false,
          error: `No se encontraron imágenes en ${this.directorioImagenes}`,
        };
      }

      // Comparar con todas las imágenes
      const comparaciones = [];

      for (const imagen of imagenes) {
        const rutaImagen = path.join(this.directorioImagenes, imagen);

        const resultado = await this.comparador.comparar(
          rutaImagenBusqueda,
          rutaImagen,
        );

        if (resultado.exito) {
          // if (!resultado?.sonVisualmenteIguales) {
          //   return {
          //     exito: false,
          //     error:
          //       "No existe ninguna imagen visualmente igual a la imagen de búsqueda",
          //   };
          // }
          // Calcular similitud (100 - diferencia)
          const similitud = 100 - resultado.diferenciaPorcentaje;

          comparaciones.push({
            nombre: imagen,
            ruta: rutaImagen,
            similitud: parseFloat(similitud.toFixed(2)),
            diferencia: resultado.diferenciaPorcentaje,
            pixelesesDiferentes: resultado.pixelesesDiferentes,
          });
        }
      }

      if (comparaciones.length === 0) {
        return {
          exito: false,
          error: "No se pudieron comparar las imágenes",
        };
      }

      // Ordenar por similitud (mayor a menor)
      comparaciones.sort((a, b) => b.similitud - a.similitud);

      // Retornar la más parecida
      const imagenMasParecida = comparaciones[0];

      return {
        exito: true,
        imagen: imagenMasParecida.nombre,
        ruta: imagenMasParecida.ruta,
        similitud: imagenMasParecida.similitud,
        diferencia: imagenMasParecida.diferencia,
        comparaciones: comparaciones,
      };
    } catch (error) {
      return {
        exito: false,
        error: error.message,
      };
    }
  }

  /**
   * Busca las N imágenes más parecidas
   * @param {string} rutaImagenBusqueda - Ruta de la imagen a buscar
   * @param {number} limite - Número de resultados (default: 3)
   * @returns {Promise<{exito: boolean, imagenes?: Array, error?: string}>}
   */
  async encontrarImagenesParecidas(rutaImagenBusqueda, limite = 3) {
    const resultado = await this.encontrarImagenMasParecida(rutaImagenBusqueda);

    if (!resultado.exito) {
      return resultado;
    }

    return {
      exito: true,
      imagenes: resultado.comparaciones.slice(0, limite),
      total: resultado.comparaciones.length,
    };
  }

  /**
   * Busca imágenes con similitud mayor a un umbral
   * @param {string} rutaImagenBusqueda - Ruta de la imagen a buscar
   * @param {number} umbralSimilitud - Umbral mínimo de similitud (0-100)
   * @returns {Promise<{exito: boolean, imagenes?: Array, error?: string}>}
   */
  async encontrarImagenesConUmbral(rutaImagenBusqueda, umbralSimilitud = 80) {
    const resultado = await this.encontrarImagenMasParecida(rutaImagenBusqueda);

    if (!resultado.exito) {
      return resultado;
    }

    const imagenesEncontradas = resultado.comparaciones.filter(
      (img) => img.similitud >= umbralSimilitud,
    );

    return {
      exito: true,
      imagenes: imagenesEncontradas,
      total: imagenesEncontradas.length,
      umbral: umbralSimilitud,
    };
  }
}

export default BuscadorImagenesSimilares;
