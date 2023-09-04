import { config } from "dotenv";
import { Server } from "./structures/Server";

config()

const server = new Server(process.env.port)