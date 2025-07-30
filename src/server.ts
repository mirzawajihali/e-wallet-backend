import { Server } from "http";
import { env } from "./app/config/env";
import mongoose from "mongoose";
import app from "./app";

let server : Server;

const startServer= async () => {
    try{
        await mongoose.connect(env.MONGO_URI)

        console.log("Connected to MongoDB");
        server = app.listen(env.PORT, () => {
            console.log(`Server is running on port ${env.PORT}`);
        });
    }
    catch(error){
        console.log(error);
    }
}