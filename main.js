import ComparadorImagenes from "./src/comparator.js";

async function main(
  urlImage1 = "./imagenes/tomy.jpg",
  urlImage2 = "./imagenes/modificada2.jpg",
) {
  const comparador = new ComparadorImagenes({
    threshold: 0.1,
    includeAA: false,
  });

  console.log("🔄 Comparando imágenes...\n");

  const resultado = await comparador.comparar(urlImage1, urlImage2);

  if (resultado.exito) {
    console.log("Resultado de comparación:");
    console.log(`   Diferencia: ${resultado.diferenciaPorcentaje}%`);
    console.log(
      `   Píxeles diferentes: ${resultado.pixelesesDiferentes} / ${resultado.pixelesTotales}`,
    );
    console.log(
      `   ¿Son iguales?: ${
        resultado.sonVisualmenteIguales ? "✅ Sí" : "❌ No"
      }\n`,
    );

    // Guardar imagen de diferencias para debug
    if (!resultado.sonVisualmenteIguales) {
      const guardado = await comparador.guardarImagenDiferencias(
        "./imagenes/diferencias.png",
      );
      if (guardado) {
        console.log(
          "📸 Imagen de diferencias guardada en ./imagenes/diferencias.png",
        );
      }
    }
    console.log(resultado);
  } else {
    console.error("❌ Error:", resultado.error);
  }
}

// Ejecutar
main().catch((err) => console.error("Error fatal:", err));
