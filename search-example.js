import BuscadorImagenesSimilares from "./src/services/search-match.service.js";

async function main() {
  const buscador = new BuscadorImagenesSimilares("./imagenes");

  console.log("🔍 Buscando imagen más parecida...\n");

  // Buscar la imagen más parecida
  const resultado = await buscador.encontrarImagenMasParecida(
    "./imagenes/test/original.jpg",
  );

  if (resultado.exito) {
    console.log("📊 Resultado de búsqueda:");
    console.log(`   Imagen más parecida: ${resultado.imagen}`);
    console.log(`   Similitud: ${resultado.similitud}%`);
    console.log(`   Diferencia: ${resultado.diferencia}%\n`);

    console.log("📋 Todas las comparaciones:");
    resultado.comparaciones.forEach((comp, index) => {
      console.log(
        `   ${index + 1}. ${comp.nombre} - Similitud: ${comp.similitud}%`,
      );
    });

    console.log(resultado);
  } else {
    console.error("❌ Error:", resultado.error);
  }
}

// Ejecutar
main().catch((err) => console.error("Error fatal:", err));
