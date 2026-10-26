import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT) || 5000;

async function bootstrap(): Promise<void> {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Riffly API running on port ${PORT}`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
