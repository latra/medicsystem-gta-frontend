# Despliegue en GitHub Pages

## Configuración Inicial

### 1. Preparar el repositorio

1. Asegúrate de que tu repositorio esté en GitHub
2. El repositorio debe ser público o tener GitHub Pages habilitado para repositorios privados

### 2. Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Pages**
3. En **Source**, selecciona **GitHub Actions**
4. Esto habilitará el despliegue automático

### 3. Configurar el workflow

El archivo `.github/workflows/deploy.yml` ya está configurado y se ejecutará automáticamente cuando:
- Hagas push a la rama `main`
- Crees un pull request a la rama `main`

## Despliegue Automático

### Pasos para desplegar:

1. **Hacer commit y push de tus cambios:**
   ```bash
   git add .
   git commit -m "Actualización para despliegue"
   git push origin main
   ```

2. **Verificar el despliegue:**
   - Ve a la pestaña **Actions** en tu repositorio
   - Verifica que el workflow "Deploy to GitHub Pages" se ejecute correctamente
   - Una vez completado, tu sitio estará disponible en: `https://[tu-usuario].github.io/hospreal-front`

## Configuración Local

### Para desarrollo local:
```bash
npm run dev
```

### Para build de producción local:
```bash
npm run build
```

### Para exportar estáticamente:
```bash
npm run export
```

## Notas Importantes

1. **Base Path**: La aplicación está configurada para funcionar en `/hospreal-front` en producción
2. **Imágenes**: Las imágenes están configuradas como `unoptimized: true` para compatibilidad con exportación estática
3. **Rutas**: Todas las rutas terminan con `/` para compatibilidad con GitHub Pages

## Solución de Problemas

### Si el despliegue falla:
1. Verifica que el workflow se ejecute en la pestaña **Actions**
2. Revisa los logs del workflow para identificar errores
3. Asegúrate de que todas las dependencias estén en `package.json`

### Si las rutas no funcionan:
1. Verifica que `basePath` esté configurado correctamente en `next.config.ts`
2. Asegúrate de que `trailingSlash: true` esté habilitado

## URLs

- **Desarrollo local**: `http://localhost:3000`
- **Producción**: `https://[tu-usuario].github.io/hospreal-front` 