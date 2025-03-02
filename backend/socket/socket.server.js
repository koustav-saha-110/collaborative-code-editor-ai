import { Server } from "socket.io";
import model from "../lib/gemini.js";

let io;

export const initSocketServer = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        socket.on("join_room", (data) => {
            socket.join(data.roomId);
            socket.to(data.roomId).emit("new_user_joined", {
                username: data.username,
            });

            socket.to(data.roomId).emit("receive_message", {
                username: "System",
                message: `${data.username} joined the room`,
                time: data.time,
            });
        });

        socket.on("ask_ai", async (data) => {
            io.to(data.roomId).emit("receive_message", {
                username: data.username,
                message: data.message,
                time: data.time,
            });

            io.to(data.roomId).emit("code_change", {
                code: "...",
                message: "AI Generating Code..",
            });

            const result = await model.generateContent(data.message.slice(4));
            io.to(data.roomId).emit("code_change", {
                code: result.response.text(),
                message: "Code Changed by AI",
            });

            io.to(data.roomId).emit("receive_message", {
                username: "System",
                message: `Code Changed by AI`,
                time: data.time,
            });
        });

        socket.on("changing_code", (data) => {
            socket.to(data.roomId).emit("code_change", {
                code: data.code,
                message: `Code Changed by ${data.username}`,
            });

            io.to(data.roomId).emit("receive_message", {
                username: "System",
                message: `Code Changed by ${data.username}`,
                time: data.time,
            });
        });

        socket.on("typing", (data) => {
            socket.to(data.roomId).emit("someone_typing", {
                username: data.username,
            });

            setTimeout(() => {
                socket.to(data.roomId).emit("stop_typing");
            }, 3000);
        });

        socket.on("op_message", (data) => {
            io.to(data.roomId).emit("receive_message", {
                username: data.username,
                message: data.message,
                time: data.time,
            });
        });

        socket.on("leave_room", (data) => {
            socket.leave(data.roomId);
            io.to(data.roomId).emit("user_left", {
                username: data.username,
            });

            io.to(data.roomId).emit("receive_message", {
                username: "System",
                message: `${data.username} left the room`,
                time: data.time,
            });
        });

        socket.on("disconnect", () => {
            console.log("user disconnected", socket.id);
        });
    });
};
