import "dotenv/config";
import express from "express";
import cors from "cors";
import { casesRouter } from "./routes/cases.js";
import { usersRouter } from "./routes/users.js";
import { certificatesRouter } from "./routes/certificates.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "vitalpaws-backend", ts: Date.now() });
});

app.use("/cases", casesRouter);
app.use("/users", usersRouter);
app.use("/certificates", certificatesRouter);

app.listen(PORT, () => {
  console.log(`[vitalpaws-backend] http://localhost:${PORT}`);
});
