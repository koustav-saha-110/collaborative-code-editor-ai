import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { initSocketServer } from "./socket/socket.server.js";
import path from "path";

dotenv.config();
const __dirname = path.resolve();
const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
}

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 8000;
initSocketServer(httpServer);

app.use(cors(corsOptions));
app.use(express.json());

// For Deployment
app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get('*', (_, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

httpServer.listen(PORT, () => {
    console.log(`Server started on port http://localhost:${PORT}/`);
});
