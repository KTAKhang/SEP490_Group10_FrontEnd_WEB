import { io } from "socket.io-client";

export const socket = io("http://localhost:3001", {
  withCredentials: true,
  autoConnect: false,   // ❗ không tự connect
  reconnection: false,  // ❗ không tự reconnect
});
