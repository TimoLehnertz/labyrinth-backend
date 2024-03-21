import cors from "cors";
import express, { Request, Response } from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { jwtFromCookieHeader } from "./lib/jwt";
import { AddFriendEndpoint } from "./old/endpoints/AddFriendEndpoint";
import bodyParser from "body-parser";
import { FriendRequestsWebSocket } from "./old/endpoints/websockets/FriendRequestsWebSocket";
import { AcceptFriendEndpoint } from "./old/endpoints/AcceptFriendEndpoint";
import { DenyFriendEndpoint } from "./old/endpoints/DenyFriendEndpoint";
import { GetFriendsEndpoint } from "./old/endpoints/GetFriendsEndpoint";
import { RemoveFriendEndpoint } from "./old/endpoints/RemoveFriendEndpoint";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

app.use(bodyParser.raw());
// app.use(express.static("src/public"));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.post("/addFriend", async (request: Request, response: Response) => {
  new AddFriendEndpoint().process(request, response);
});

app.post(
  "/acceptFriendRequest",
  async (request: Request, response: Response) => {
    new AcceptFriendEndpoint().process(request, response);
  }
);

app.post("/denyFriendRequest", async (request: Request, response: Response) => {
  new DenyFriendEndpoint().process(request, response);
});

app.post("/getFriends", async (request: Request, response: Response) => {
  new GetFriendsEndpoint().process(request, response);
});

app.post("/removeFriend", async (request: Request, response: Response) => {
  new RemoveFriendEndpoint().process(request, response);
});

new FriendRequestsWebSocket(io.of("/friendRequests"));
// friendRequests.on("connection", async (socket: Socket) => {
//   const jwt = jwtFromCookieHeader(socket.request.headers.cookie);
//   // console.log(socket.request.headers.cookie);
//   if (!jwt) {
//     socket.disconnect();
//     return;
//   }
//   friendRequestsWebSocket.onconnection(socket, jwt);

//   console.log("New client connected");

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });

//   socket.emit("chat message", "Connected to Socket.IO server");

//   socket.on("gameABC", (data: any) => {
//     console.log("received:", data);
//     io.emit("GameState", data);
//   });
// });

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Socket.IO server listening on port ${port}`);
});
