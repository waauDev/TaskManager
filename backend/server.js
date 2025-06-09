require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db")

const app = express();

//Middelware to handle cors

app.use(
    cors({
        origin:process.env.CLIENT_URL || "*",
        methods:["GET", "POST","PUT", "DELETE"],
        allowedHeaders:["Content-Type", "Authorization"]
    })
)

// Conectar base de datos

connectDB();


app.use(express.json());



// Rutas
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/tasks", taskRoutes);
// app.use("/api/reports", reportRoutes);

// Iniciar servidor

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Servidor corriendo en puerto ${PORT}`));

