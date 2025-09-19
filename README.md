# 📌 Mini Blog API

API RESTful construida con **Node.js**, **Express** y **PostgreSQL** que permite manejar usuarios, perfiles, mensajes, likes y relaciones de seguidores.

---

## 🚀 Características
- Registro e inicio de sesión con JWT.
- Creación y gestión de usuarios y perfiles.
- Publicación y consulta de mensajes.
- Likes en mensajes.
- Seguimiento (followers/following) entre usuarios.
- Feeds personalizados y globales.
- Documentación en **OpenAPI (Swagger)**.

---

## ⚙️ Requisitos previos
Antes de iniciar, asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) o un contenedor con Docker
- [npm](https://www.npmjs.com/) v9+

---

## 📥 Instalación

1. Clonar el repositorio:
   ```bash
   git clone  https://github.com/Defiilol11/Express-API-blog.git
   cd Express-API-blog
   ```

2. Instalar dependencias:
   ```bash
   npm install express swagger-ui-express yamljs pg bcrypt jsonwebtoken express-validator helmet cors morgan dotenv
   npm install --save-dev nodemon
   ```

3. Crear archivo `.env` en la raíz con las variables necesarias:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://usuario:password@localhost:5432/midb
   JWT_SECRET=supersecreto
   ```

4. Crear la base de datos y correr los scripts SQL para tablas (`users`, `profiles`, `messages`, `follows`, `likes`).

---

## ▶️ Ejecución

- Modo desarrollo:
  ```bash
  npm run dev
  ```

- Modo producción:
  ```bash
  npm start
  ```

El servidor quedará corriendo en:  
👉 `http://localhost:3000`

---

## 📚 Documentación del API

### Opción 1: Usar Swagger UI
1. Abrir [Swagger Editor](https://editor.swagger.io/).
2. Importar el archivo `openapi.yaml`.
3. Explorar y probar los endpoints desde la interfaz.

### Opción 2: Usar Postman
- Importar el archivo `openapi.yaml` directamente en Postman como colección.
- Podrás ver todos los endpoints agrupados.

---

## 🔑 Autenticación
- Algunas rutas requieren un **JWT** en el header:
  ```
  Authorization: Bearer <token>
  ```
- Para obtener el token, primero regístrate (`POST /api/users`) y luego inicia sesión (`POST /api/users/login`).

---

## 📌 Endpoints principales

### 👤 Usuarios
- `POST /api/users` → Crear usuario
- `POST /api/users/login` → Iniciar sesión
- `GET /api/users/{id}` → Ver usuario + perfil
- `DELETE /api/users/{id}` → Eliminar usuario

### 💬 Mensajes
- `POST /api/messages` → Crear mensaje
- `GET /api/messages/all` → Todos los mensajes
- `GET /api/messages/latest` → Últimos 10 mensajes
- `GET /api/messages/feed` → Feed de seguidos
- `GET /api/messages/user/{id}` → Mensajes de un usuario
- `GET /api/messages/search/{term}` → Buscar mensajes
- `POST /api/messages/{id}/like` → Dar like
- `DELETE /api/messages/{id}/like` → Quitar like
- `GET /api/messages/{id}/likes` → Ver likes de un mensaje

### 🔗 Follows
- `POST /api/follows` → Seguir usuario
- `DELETE /api/follows` → Dejar de seguir
- `GET /api/follows/feed` → Feed de mensajes de seguidos
- `GET /api/follows/following` → A quién sigo
- `GET /api/follows/followers` → Mis seguidores
- `GET /api/follows/{id}/following` → A quién sigue otro usuario
- `GET /api/follows/{id}/followers` → Seguidores de otro usuario

---

## 🛠 Scripts disponibles
En `package.json` tienes:

- `npm start` → Inicia en producción
- `npm run dev` → Inicia en modo desarrollo con **nodemon**
- `npm test` → (reservado para pruebas)

---

## ✨ Ejemplo rápido

```bash
# Crear usuario
curl -X POST http://localhost:3000/api/users    -H "Content-Type: application/json"    -d '{"email": "test@test.com", "password": "123456", "display_name": "Carlos"}'

# Iniciar sesión
curl -X POST http://localhost:3000/api/users/login    -H "Content-Type: application/json"    -d '{"email": "test@test.com", "password": "123456"}'
```

---

## 📄 Licencia
MIT © 2025
