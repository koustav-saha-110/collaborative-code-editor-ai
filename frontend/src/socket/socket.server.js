import io from "socket.io-client";

const SOCKET_URL = import.meta.env.MODE === "development" ? "http://localhost:8000/" : "/";
let socket;

export const initializeSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }

    socket = io(SOCKET_URL);
}

export const getSocket = () => {
    if (!socket) {
        throw new Error('Socket is not initialized');
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
