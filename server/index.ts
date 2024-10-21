import express from 'express'
import cors from "cors"
import http from "http"
import { Server } from "socket.io"
import Redis from 'ioredis'
import "dotenv/config"

const app = express()

app.use(cors())

const REDIS_URL = process.env.REDIS_CONNECTION_STRING || ""

// TODO: We create two different connections
const redis = new Redis(REDIS_URL) // Normal redis instance send data to the redis server
const subRedis = new Redis(REDIS_URL) // Subscribes to the redis server to listen for messages

const server = http.createServer(app)

// TODO: (PROTOCOL) Create a websocket server provides a real-time connection between the server and the client
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
})

// TODO: Distribute messages that are received from the subRedis to the users on the room
subRedis.on("message", (channel, message) => {
  console.log("Received message from channel", channel, message)
  io.to(channel).emit("room-update", message)
})

subRedis.on("error", (err) => {
  console.error("Redis subscription error", err)
})

io.on("connection", async (socket) => {

  const { id } = socket

  socket.on("join-room", async (room: string) => {
    console.log("User joined room", room);

    const subscribedRooms = await redis.smembers("subscribed-rooms")
    await socket.join(room) // ? Join the room
    await redis.sadd(`rooms:${id}`, room) // ? Add the room to the user's list of rooms
    await redis.hincrby("room-connections", room, 1)

    if (!subscribedRooms.includes(room)) {
      subRedis.subscribe(room, async (err) => {
        if (err) {
          console.error(err)
        } else {
          await redis.sadd("subscribed-rooms", room)
          console.log("Subscribed to room", room)
        }
      })
    }
  })

  socket.on("disconnect", async () => {
    const { id } = socket

    const joinedRooms = await redis.smembers(`rooms:${id}`)

    await redis.del(`rooms:${id}`)

    joinedRooms.forEach(async (room) => {
      const remainingConnections = await redis.hincrby("room-connections", room, -1)

      if (remainingConnections <= 0) {
        await redis.hdel("room-connections", room)
        await subRedis.unsubscribe(room, async (err) => {
          if (err) {
            console.error("Failed to unsubscribe", err)
          } else {
            await redis.srem("subscribed-rooms", room)
            console.log("Unsubscribed from room", room)
          }
        })
      }
    })
  })
})

// TODO: Start the server
const PORT = process.env.PORT || 8080

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})