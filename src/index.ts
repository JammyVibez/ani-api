import express from "express";
import { config } from "dotenv";
import { router } from "./routes/route";
import helmet from "helmet";
import { corsConfig } from "./utils/cors-config";
import { cacheCtrlConfig } from "./utils/express-cache-ctrl";

config();

const app = express();
const PORT = process.env.PORT || 9090;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(helmet());
app.use(cacheCtrlConfig);
app.use(corsConfig);

app.use("/", router);

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));

export default app;
