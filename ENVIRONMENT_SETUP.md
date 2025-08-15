# Configuración de Variables de Entorno

## Variables Requeridas

Para que la aplicación funcione correctamente, necesitas configurar las siguientes variables de entorno:

### Firebase Configuration
Crea un archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_de_firebase
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain_de_firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id_de_firebase
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket_de_firebase
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id_de_firebase
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id_de_firebase
```

### API Configuration
```env
NEXT_PUBLIC_API_BASE_URL=tu_url_base_de_la_api
```

## Configuración en GitHub Pages

Para el despliegue en GitHub Pages, necesitas configurar estas variables como secretos del repositorio:

1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Secrets and variables** → **Actions**
3. Agrega cada variable como un secreto del repositorio

### Variables para GitHub Actions
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `API_BASE_URL`

## Obtener Configuración de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Project Settings** → **General**
4. En la sección "Your apps", encuentra tu app web
5. Copia la configuración del objeto `firebaseConfig`

## Notas Importantes

- Las variables que empiezan con `NEXT_PUBLIC_` estarán disponibles en el cliente
- Para GitHub Pages, usa las variables sin el prefijo `NEXT_PUBLIC_`
- Nunca commits el archivo `.env.local` al repositorio
- El archivo `.env.local` ya está en `.gitignore` 