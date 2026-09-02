# Easy Notes

A full-stack notes workspace built for a portfolio: a responsive React interface backed by a Spring Boot REST API, JPA, and MySQL. The app supports creating, reading, searching, sorting, editing, and deleting notes, with clear loading, empty, and error states.

## Stack

- **Frontend:** React 18, Vite, Lucide icons, responsive CSS
- **Backend:** Java 11+, Spring Boot, Spring Web, Spring Data JPA, Bean Validation
- **Data:** MySQL locally; ephemeral H2 for the Render demo profile
- **API docs:** Springdoc OpenAPI / Swagger UI
- **Deployment:** Multi-stage Docker build and Render Blueprint

## Run locally

### 1. Start the API

Copy the safe example file and add your local MySQL password. The resulting `.env` file is ignored by Git:

```powershell
Copy-Item .env.example .env
# Open .env and replace the example password with your real password.
```

Alternatively, provide the credentials through environment variables:

```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your-mysql-password"
```

The default JDBC URL creates the `easy_notes` database automatically when the configured user has `CREATE DATABASE` permission.

```bash
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

The API runs at `http://localhost:8081`.

### 2. Start React

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to Spring Boot, so no extra local configuration is needed.

## Production build

Build React first, then package Spring Boot. Maven copies `frontend/dist` into the JAR's static resources:

```bash
cd frontend
npm ci
npm run build
cd ..
./mvnw clean package
java -jar target/easy-notes-1.0.0.jar
```

The production UI and API are both served from `http://localhost:8081` when using the default profile.

You can also build the complete application in one step with Docker:

```bash
docker build -t easy-notes .
docker run --rm -p 8080:8080 -e SPRING_PROFILES_ACTIVE=render easy-notes
```

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/notes` | List all notes |
| `POST` | `/api/notes` | Create a note |
| `GET` | `/api/notes/{id}` | Get one note |
| `PUT` | `/api/notes/{id}` | Update a note |
| `DELETE` | `/api/notes/{id}` | Delete a note |

Create and update requests use this shape:

```json
{
  "title": "Portfolio launch",
  "content": "Write the case study and publish the project."
}
```

Swagger UI is available at `http://localhost:8081/swagger-ui.html`.

## Configuration

- `VITE_API_URL`: full API origin when the frontend is deployed separately. Leave empty for the same-origin production build.
- `CORS_ALLOWED_ORIGINS`: comma-separated frontend origins allowed to call the API directly. Defaults to `http://localhost:5173`.
- `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`: MySQL settings loaded from environment variables or the Git-ignored root `.env` file. `DB_PASSWORD` is required. The default URL includes `createDatabaseIfNotExist=true`.
- `SERVER_PORT`: overrides the local backend port, which defaults to `8081`.
- `SPRING_PROFILES_ACTIVE=render`: uses an in-memory H2 database for a credential-free demo. Notes reset when the service restarts.

## Deploy on Render

Create a new Blueprint from this repository. `render.yaml` builds the React frontend and Spring Boot API together using the included Dockerfile, then serves the finished app as one web service. The demo profile starts with three sample notes so reviewers can explore the UI immediately.
