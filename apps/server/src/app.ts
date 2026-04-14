import express, { type Express } from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";

const app: Express = express();

// Render/Vercel/most PaaS terminate TLS at a reverse proxy. Trusting the first
// hop lets Express see the real protocol so `Secure` cookies are issued.
app.set("trust proxy", 1);

// Cookie-based auth requires credentialed CORS: the browser will refuse to
// send/accept `hp_session` on cross-origin requests unless both the server
// allows credentials AND the `Access-Control-Allow-Origin` header echoes a
// specific origin (wildcard is disallowed with credentials). `CORS_ORIGIN`
// can be a comma-separated list for multi-environment setups.
const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api", routes);
app.use(errorHandler);

export default app;
