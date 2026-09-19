import express from "express";
import productRouter from "./routes/product.routes.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Golden pipeline order — do not rearrange
app.use(requestLogger);
app.use(express.json());
app.use("/api/products", productRouter);

// Test route to prove the error handler catches thrown errors cleanly
app.get("/boom", () => {
  throw new Error("Kaboom!");
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`API on :${PORT}`);
});