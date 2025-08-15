#!/bin/bash

echo "🧪 Probando build local..."

# Verificar que las variables de entorno estén configuradas
if [ ! -f .env.local ]; then
    echo "❌ Error: Archivo .env.local no encontrado"
    echo "📝 Crea el archivo .env.local con las variables de entorno necesarias"
    echo "📖 Consulta ENVIRONMENT_SETUP.md para más detalles"
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Ejecutar lint
echo "🔍 Ejecutando lint..."
npm run lint

# Build de producción
echo "🏗️ Ejecutando build de producción..."
npm run build

# Verificar que se generó la carpeta out
if [ -d "out" ]; then
    echo "✅ Build exitoso! La carpeta 'out' se generó correctamente"
    echo "📁 Contenido de la carpeta out:"
    ls -la out/
else
    echo "❌ Error: La carpeta 'out' no se generó"
    exit 1
fi

echo "🎉 ¡Todo listo para el despliegue!" 