# GlobalFreelance

GlobalFreelance is a full-stack freelance workspace with a React/Vite frontend and an Express/MongoDB backend. It includes account authentication, Google sign-in, client/project/invoice workspace features, AI invoice drafting, and PayPal payments.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- MongoDB, either running locally or available through MongoDB Atlas

## Local setup

The frontend and backend are separate npm applications inside this repository. Open two terminals from the repository root.

### 1. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set the values for the services you want to use:

- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: a long, random secret used to sign login sessions.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: credentials for Google sign-in.
- `GROQ_API_KEY`: required for AI invoice drafting.
- `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`: PayPal sandbox credentials for local testing.
- `PAYPAL_WEBHOOK_ID`: PayPal webhook ID if webhook verification is used.

For Google sign-in on localhost, set `GOOGLE_REDIRECT_URI` to:

```text
http://localhost:3000/api/auth/google/callback
```

In the Google OAuth client settings, add these values:

- Authorized JavaScript origin: `http://localhost:5173`
- Authorized redirect URI: `http://localhost:3000/api/auth/google/callback`

Start the backend:

```bash
cd backend
npm install
npm start
```

The backend listens on port `3000` by default.

### 2. Configure and start the frontend

In a second terminal from the repository root:

```bash
cp frontend/.env.example frontend/.env.local
```

For local development, `frontend/.env.local` should contain:

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (by default, `http://localhost:5173`).

## Useful commands

Run these from the corresponding folder:

| Folder | Command | Description |
| --- | --- | --- |
| `frontend` | `npm run dev` | Start the Vite development server |
| `frontend` | `npm run build` | Create a production frontend build |
| `frontend` | `npm run lint` | Run Oxlint |
| `frontend` | `npm run preview` | Preview a production build |
| `backend` | `npm start` | Start the Express backend |

## Deployment configuration

Set environment variables in your hosting provider rather than committing `.env` files.

- Frontend: set `VITE_API_BASE_URL` to the backend API base URL, including `/api` (for example, `https://api.example.com/api`).
- Backend: set `PORT`, `FRONTEND_URL` to the deployed frontend origin, and `BACKEND_URL` to the deployed backend origin.
- Google OAuth: use the deployed frontend origin as the authorized JavaScript origin and `${BACKEND_URL}/api/auth/google/callback` as the authorized redirect URI. Set `GOOGLE_REDIRECT_URI` to that exact same redirect URI.
- Use HTTPS for deployed services and configure production credentials in the hosting provider's secret manager.

## Repository layout

```text
backend/    Express API, MongoDB models, authentication and integrations
frontend/   React application built with Vite
README.md   Project setup and usage instructions
```

Never commit `.env`, `.env.local`, API keys, OAuth client secrets, JWT secrets, or payment credentials. The root `.gitignore` ignores environment files while allowing `.env.example` templates.
