const Task = require("../models/Task");

const getTasks= async(req, res)=>{
    try {
        const {status} = req.query;
        let filter ={};
        
        if(status){
            filter.status = status;
        }

        let tasks;

        if(req.user.role === "admin"){
            tasks = await Task.find(filter).populate(
                "assignedTo",
                "name email profileImageUrl"
            )
        }else{
            tasks = await Task.find({...filter, assignedTo:req.user._id}).populate(
                "assignedTo",
                "name email profileImageUrl"
            )   
        }

        tasks = await Promise.all(
            tasks.map(async(task)=>{
                const completedCount = task.todoCheckList.filter(
                    (item)=> item.completed
                ).length;
                return {...task._doc, completedCount:completedCount}
            })
            
        );

        // Resumen cuenta status tareas

        const allTasks = await Task.countDocuments(
            req.user.role === "admin" ? {}: {assignedTo:req.user._id}
        );

        const pendingTask =  await Task.countDocuments({
            ...filter,
            status:"Pendiente",
            ...(req.user.role !== "admin" && {assignedTo:req.user._id}),
        })

        const inProgressTask = await Task.countDocuments({
            ...filter,
            status:"En Proceso",
            ...(req.user.role !== "admin" && {assignedTo:req.user._id})
        })

        const completedTask = await Task.countDocuments({
            ...filter,
            status:"Completado",
            ...(req.user.role !== "admin" && {assignedTo:req.user._id})
        })

        res.json({
            tasks,
            statusSummary:{
                all: allTasks,
                pendingTask,
                inProgressTask,
                completedTask,
            }
        })
        
    } catch (error) {
        res.status(500).json({message:"Error Servidor:", error: error.message});
    }
};

const getTaskById = async(req, res)=>{
    try {
        
    } catch (error) {
        res.status(500).json({message:"Error Servidor:", error: error.message});
    }
};

const createTask = async(req, res)=>{
    try {
        const{
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoCheckList,
        }=req.body;

        if(!Array.isArray(assignedTo)){
            return res
                .status(400)
                .json({message:"assignedTo debe ser un array"});
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy:req.user._id,
            todoCheckList,
            attachments,
        })

        res.status(201).json({message:"Tarea creada satisfactoriamente", task});
        
    } catch (error) {
        res.status(500).json({message:"Error Servidor:", error: error.message});
    }
};

const updateTask = async(req, res) =>{
    try {
        
    } catch (error) {
        res.status(500).json({message:"Error Servidor:", error: error.message});
    }
};

const deleteTask = async(req, res)=>{
    try {
        
    } catch (error) {
        res.status(500).json({message:"Error Servidor:", error: error.message});
    }
};

const updateTaskStatus = async(req, res)=>{
    try {
        
    } catch (error) {
        res.status(500).json({message:"Error Servidor:", error: error.message});
    }
};

const updateTaskCheckList = async(req, res)=>{
    try {
        
    } catch (error) {
        res.status(500).json({message:"Error Servidor:", error: error.message});
    }
};

const getDashboardData = async(req, res) =>{
    try {
        
    } catch (error) {
        res.status(500).json({message:"Error Servidor:", error: error.message});
    }
};

const getUserDashboardData = async(req,res)=>{
    try {
        
    } catch (error) {
        res.status(500).json({message:"Error Servidor:", error: error.message});
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskCheckList,
    getDashboardData,
    getUserDashboardData,
}