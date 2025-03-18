let socket;

export const connectWebSocket = () => {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
        socket = new WebSocket("ws://localhost:8080/chess");

        socket.onopen = () => {
            console.log("✅ Connected to WebSocket server.");
        };

        socket.onmessage = (event) => {
            console.log("📩 Move received:", event.data);
        };

        socket.onclose = () => {
            console.log("❌ WebSocket closed.");
        };
    }
};

export const sendMove = (from, to) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        const move = { type: "move", from, to };
        socket.send(JSON.stringify(move));
        console.log("📤 Move sent:", move);
    } else {
        console.log("⚠️ WebSocket is not connected.");
    }
};
