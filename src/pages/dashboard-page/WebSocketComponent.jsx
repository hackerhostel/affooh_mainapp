import React, { useState, useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

const WebSocketComponent = () => {
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const connectWebSocket = async () => {
            try {
                // Fetch the access token
                const session = await fetchAuthSession();
                const accessToken = session.tokens?.accessToken?.toString();
                console.log("Access Token:", accessToken);

                // Create the WebSocket connection
                const wsUrl = "wss://dev-ws.affooh.com";
                const newSocket = new WebSocket(wsUrl);

                newSocket.onopen = () => {
                    console.log("WebSocket connection established");
                    // Send the token as the first message
                    newSocket.send(JSON.stringify({ type: "auth", token: accessToken }));
                };

                newSocket.onmessage = (event) => {
                    console.log("Message from server:", event.data);
                    // Append the new message to the existing messages
                    setMessages((prevMessages) => [...prevMessages, event.data]);
                };

                newSocket.onerror = (error) => {
                    console.error("WebSocket error:", error);
                };

                newSocket.onclose = () => {
                    console.log("WebSocket connection closed");
                };

                // Save the socket to state
                setSocket(newSocket);
            } catch (error) {
                console.error("Error fetching session or connecting to WebSocket:", error);
            }
        };

        // connectWebSocket();

        // Cleanup function to close the WebSocket connection
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <div>
            <h1>WebSocket Messages</h1>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>{JSON.stringify(msg)}</li>
                ))}
            </ul>
        </div>
    );
};

export default WebSocketComponent;