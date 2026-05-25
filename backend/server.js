import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { initSocket } from "./src/sockets/server.socket.js";
// import { testAi } from "./src/services/ai.service.js";

const PORT = process.env.PORT || 8000;

const httpServer = http.createServer(app);

// initialize socket server
initSocket(httpServer);

httpServer.listen(PORT, async () => {
  console.log(`server is running on port ${PORT}`);

  try {
    await connectDB();

    if (process.env.ENABLE_AI_TEST === "true") {
      await testAi();
    } else {
      console.log(
        "Skipping AI service startup test; set ENABLE_AI_TEST=true to enable it."
      );
    }
  } catch (error) {
    console.error(
      "AI service test failed during startup:",
      error.message
    );
  }
});