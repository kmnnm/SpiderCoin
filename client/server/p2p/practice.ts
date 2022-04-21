import WebSocket = require("ws");
const express = require("express");
import { Request, Response } from "express";
const app = express();
const server = require("http").createServer(app);

const wss = new WebSocket.Server({ server: server });

wss.on("connection", function connection(ws: WebSocket) {
	console.log("A new client connected");
	ws.send("Welcome New Client!");

	ws.on("message", function message(data) {
		console.log("received: %s", data);
		ws.send("Got your message. It is : " + data);
	});
});

app.get("/", (req: Request, res: Response) => res.send("Hello World"));

server.listn(3000, () => console.log("Listening on port : 3000"));
