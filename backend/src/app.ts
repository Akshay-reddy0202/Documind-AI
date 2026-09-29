import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env.js";
import router from "./routes/index.js";
import notFoundMiddleware from "./middleware/not-found.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.use("/api", router);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
