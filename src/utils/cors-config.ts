import cors from "cors";

const origin = [
  "http://localhost:3000" // ✅ add this
];

export const corsConfig = cors({
  origin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
