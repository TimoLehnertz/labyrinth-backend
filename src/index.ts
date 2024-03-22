import cors from "cors";
import express, { Request, Response } from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import bodyParser from "body-parser";
import { AddFriendEndpoint } from "./Endpoints/AddFriendEndpoint";
import { DeleteFriendEndpoint } from "./Endpoints/DeleteFriendEndpoint";
import { GetFriendsEndpoint } from "./Endpoints/GetFriendsEndpoint";
import { AcceptFriendRequestEndpoint } from "./Endpoints/AcceptFriendRequestEndpoint";
import { DeleteFriendRequestEndpoint } from "./Endpoints/DeleteFriendRequestEndpoint";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

// app.use(express.static("src/public"));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.post("/addFriend", async (request: Request, response: Response) => {
  new AddFriendEndpoint().handle(request, response);
});

app.post("/deleteFriend", async (request: Request, response: Response) => {
  new DeleteFriendEndpoint().handle(request, response);
});

app.post("/getFriends", async (request: Request, response: Response) => {
  new GetFriendsEndpoint().handle(request, response);
});

app.post(
  "/acceptFriendRequest",
  async (request: Request, response: Response) => {
    new AcceptFriendRequestEndpoint().handle(request, response);
  }
);

app.post(
  "/deleteFriendRequest",
  async (request: Request, response: Response) => {
    new DeleteFriendRequestEndpoint().handle(request, response);
  }
);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Socket.IO server listening on port ${port}`);
});
