import app from "./app.js";
import { connectDatabase } from "./lib/db.js";

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
