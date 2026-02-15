import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export const createSocket = (): Socket => {
    return io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
    });
};

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = createSocket();
    }
    return socket;
};
