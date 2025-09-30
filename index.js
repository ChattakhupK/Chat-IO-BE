import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const httpServer = createServer(app);

// create socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.URL_FB_URL,
    methods: ["GET", "POST"],
  },
});

// เก็บจำนวนคนออนไลน์
let onlineUsers = new Set();

io.on("connection", (socket) => {
  console.log("user connected", socket.id);
  onlineUsers.add(socket.id);

  // ส่งจำนวนคนออนไลน์ไปบอกทุก client
  io.emit("online_users", onlineUsers.size);

  //   รับข้อความจาก client
  socket.on("send_message", (data) => {
    console.log("Message:", data);

    // ส่งต่อให้ทุกคนแบบ broadcast
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    onlineUsers.delete(socket.id); // ลบออกจาก set
    io.emit("online_users", onlineUsers.size); // แจ้ง client ใหม่
  });
});

httpServer.listen(3000, () => {
  console.log("Server is running on port3000");
});
