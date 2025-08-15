# HospReal Frontend

Aplicación web para gestión hospitalaria desarrollada con Next.js, React y Firebase.

## 🚀 Características

- Autenticación con Firebase
- Gestión de pacientes
- Sistema de admisiones
- Interfaz moderna con Tailwind CSS
- Diseño responsive

## 🛠️ Tecnologías

- **Framework**: Next.js 15
- **Frontend**: React 19
- **Estilos**: Tailwind CSS
- **Autenticación**: Firebase Auth
- **Base de datos**: Firebase Firestore
- **Lenguaje**: TypeScript

## 📦 Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/hospreal-front.git
   cd hospreal-front
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   - Copia el archivo `.env.local.example` a `.env.local`
   - Configura las variables de Firebase y API
   - Consulta `ENVIRONMENT_SETUP.md` para más detalles

4. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

## 🌐 Despliegue en GitHub Pages

### Configuración Inicial

1. **Habilitar GitHub Pages:**
   - Ve a tu repositorio en GitHub
   - Settings → Pages
   - Source: GitHub Actions

2. **Configurar secretos del repositorio:**
   - Settings → Secrets and variables → Actions
   - Agrega las variables de Firebase y API

3. **Hacer push de los cambios:**
   ```bash
   git add .
   git commit -m "Configuración para GitHub Pages"
   git push origin main
   ```

### Despliegue Automático

El despliegue se ejecuta automáticamente cuando:
- Haces push a la rama `main`
- Creas un pull request a `main`

### URL de Producción

Tu aplicación estará disponible en:
`https://[tu-usuario].github.io/hospreal-front`

## 📋 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run lint` - Verificar código
- `npm run test:build` - Probar build localmente

## 📚 Documentación

- [Configuración de Variables de Entorno](ENVIRONMENT_SETUP.md)
- [Guía de Despliegue](DEPLOYMENT.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
