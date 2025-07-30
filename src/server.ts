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

const gracefulShutdown = (signal: string) => {
    console.log(`${signal} received: starting graceful shutdown`);
    
    if (server) {
        server.close((err) => {
            if (err) {
                console.error('Error during server close:', err);
                process.exit(1);
            }
            
            // Close database connections
            mongoose.connection.close()
                .then(() => {
                    console.log('Database connections closed');
                    console.log('Graceful shutdown completed');
                    process.exit(0);
                })
                .catch((err) => {
                    console.error('Error closing database connection:', err);
                    process.exit(1);
                });
        });
        
        // Force exit after 30 seconds
        setTimeout(() => {
            console.error('Forced shutdown after timeout');
            process.exit(1);
        }, 30000);
    } else {
        process.exit(0);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));  // Ctrl+C
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    gracefulShutdown('UNHANDLED_REJECTION');
});