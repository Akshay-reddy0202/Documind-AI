import app from "./app.js";
import { env } from "./config/env.js";

const startServer = (): void => {
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
};

startServer();
