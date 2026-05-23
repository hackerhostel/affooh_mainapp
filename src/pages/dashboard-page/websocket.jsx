import { io } from "socket.io-client";

const SOCKET_URL = "wss://dev-ws.affooh.com";

const socket = io(SOCKET_URL, {
    transports: ["websocket"], // Ensures only WebSocket is used
    reconnection: true, // Enable automatic reconnection
    reconnectionAttempts: 5, // Number of reconnection attempts
    reconnectionDelay: 3000, // Delay between attempts
});

socket.on("connect", () => {
    console.log("Connected to WebSocket Server");
});

socket.on("disconnect", (reason) => {
    console.warn("Disconnected from WebSocket:", reason);
});

socket.on("message", (data) => {
    console.log("Received message:", data);
    if (data?.type === "SEO_EXECUTION_UPDATE") {
        window.dispatchEvent(new CustomEvent("SEO_EXECUTION_UPDATE", { detail: data }));
    }
});

socket.on("SEO_EXECUTION_UPDATE", (data) => {
    window.dispatchEvent(new CustomEvent("SEO_EXECUTION_UPDATE", { detail: data }));
});

export default socket;
