import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectToDB from "./src/config/database.js";
import { testAi } from "./src/services/ai.service.js";

connectToDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`server is running on port ${PORT}`);

  await testAi();
});