const Task = require("../models/Task");
const User= require("../models/User");
const bcrypt = require("bcryptjs");


const getUsers = async(req, res)=>{
    try {

        const users = await User.find({role:'member'}).select("-password");

        // Tareas de cada uno de los usuarios

        const usersWithTaskCounts = await Promise.all(users.map(async (user)=>{
            const pendingTask = await Task.countDocuments({assignedTo:user._id, status:"Pendiente"});
            const inProgressTask = await Task.countDocuments({assignedTo:user._id, status:"En Proceso"});
            const completedTask = await Task.countDocuments({assignedTo:user._id, status:"Completado"});

            return {
                ...user._doc,
                pendingTask,
                inProgressTask,
                completedTask,
            }
        }));

        res.json(usersWithTaskCounts);

        
    } catch (error) {
        res.status(500).json({message:"Error en servidor:", error: error.message});
    }
}


const getUserById = async(req, res)=>{
    try {
        const user = await User.findById(req.params.id).select("-password");
        if(!user) return res.status(404).json({message:"Usuario no Encontrado"});
        res.json(user);
        
    } catch (error) {
        res.status(500).json({message:"Error en servidor:", error: error.message});
    }
}



module.exports ={getUsers, getUserById};