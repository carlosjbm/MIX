import sharp from "sharp";
import pixelmatch from "pixelmatch";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ComparadorImagenes {
  constructor(opciones = {}) {
    this.opciones = {
      threshold: 0.1,
      includeAA: false,
      ...opciones,
    };
  }

  async comparar(rutaImagen1, rutaImagen2) {
    try {
      // Leer y procesar imágenes con sharp - asegurar RGBA
      const img1 = await sharp(rutaImagen1)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const img2 = await sharp(rutaImagen2)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Asegurar que tienen el mismo tamaño
      if (
        img1.info.width !== img2.info.width ||
        img1.info.height !== img2.info.height
      ) {
        // Redimensionar la segunda imagen al tamaño de la primera
        const resized = await sharp(rutaImagen2)
          .resize(img1.info.width, img1.info.height)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });

        return this._compararBuffers(img1, resized, rutaImagen1, rutaImagen2);
      }

      return this._compararBuffers(img1, img2, rutaImagen1, rutaImagen2);
    } catch (error) {
      return {
        exito: false,
        error: error.message,
      };
    }
  }

  async _compararBuffers(img1, img2, ruta1, ruta2) {
    try {
      const width = img1.info.width;
      const height = img1.info.height;

      // Crear buffer para la imagen de diferencia
      const diff = Buffer.alloc(img1.data.length);

      // Comparar píxeles
      const diferencias = pixelmatch(
        img1.data,
        img2.data,
        diff,
        width,
        height,
        this.opciones,
      );

      const pixelesTotales = width * height;
      const diferenciaPorcentaje = (diferencias / pixelesTotales) * 100;

      // Guardar info de diferencia
      this.ultimaImagenDiff = {
        data: diff,
        width: width,
        height: height,
      };

      return {
        exito: true,
        diferenciaPorcentaje: parseFloat(diferenciaPorcentaje.toFixed(2)),
        sonVisualmenteIguales: diferenciaPorcentaje < 1,
        pixelesesDiferentes: diferencias,
        pixelesTotales: pixelesTotales,
      };
    } catch (error) {
      return {
        exito: false,
        error: error.message,
      };
    }
  }

  async guardarImagenDiferencias(rutaSalida) {
    if (this.ultimaImagenDiff) {
      try {
        // Convertir datos raw RGBA a imagen PNG
        await sharp(this.ultimaImagenDiff.data, {
          raw: {
            width: this.ultimaImagenDiff.width,
            height: this.ultimaImagenDiff.height,
            channels: 4,
          },
        })
          .png()
          .toFile(rutaSalida);
        return true;
      } catch (error) {
        console.error("Error guardando imagen:", error);
        return false;
      }
    }
    return false;
  }
}

export default ComparadorImagenes;
