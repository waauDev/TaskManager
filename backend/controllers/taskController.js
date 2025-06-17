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

        const task = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl",
        )

        if(!task) return res.status(404).json({message:"Tarea no encontrada"});

        res.json(task);
        
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

        const task = await Task.findById(req.params.id);

        if(!task) return res.status(404).json({message:"Tarea no encontrada"});

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoCheckList= req.body.todoCheckList || task.todoCheckList;
        task.attachments = req.body.attachments || task.attachments;

        if(req.body.assignedTo){
            if(!Array.isArray(req.body.assignedTo)){
                return res
                    .status(400)
                    .json({message:"Assignment debe ser array"});
            }
            task.assignedTo = req.body.assignedTo;
        }

        const updatedTask = await task.save();
        res.json({message:"Actualizacion realizada con exito", updatedTask});
        
    } catch (error) {
        res.status(500).json({message:"Error Servidor:", error: error.message});
    }
};

const deleteTask = async(req, res)=>{
    try {
        const task = await Task.findById(req.params.id);

        if(!task) return res.status(404).json({message:"Tarea no encontrada"});
        await task.deleteOne();
        
        res.json({message:"Tarea eliminada exitosamente"});
    } catch (error) {
        res.status(500).json({message:"Error Servidor:", error: error.message});
    }
};

const updateTaskStatus = async(req, res)=>{
    try {
        const task = await Task.findById(req.params.id);

        if(!task) return res.status(404).json({message:"Tarea no encontrada"});

        const isAssigned = task.assignedTo.some(
            (userId)=> userId.toString()=== req.user._id.toString()
        );

        if(!isAssigned && req.user.role !== "admin"){
            return res.status(403).json({message:"No Autorizado"});
        }

        task.status = req.body.status || task.status;

        if(task.status === "Completado") {
            task.todoCheckList.forEach((item)=> (item.completed=true));
            task.progress= 100;
        }

        await task.save();

        res.json({message:"Status de tarea actualizado", task});
        

    } catch (error) {
        res.status(500).json({message:"Error Servidor:", error: error.message});
    }
};

const updateTaskCheckList = async(req, res)=>{
    try {
        const {todoCheckList} = req.body;
        const task = await Task.findById(req.params.id);        

        if(!task) return res.status(404).json({message:"Tarea no encontrada"});

        if(!task.assignedTo.includes(req.user._id) && req.user.role !== "admin" ){
            return res
                .status(403)
                .json({message:"No autorizado para actualizar checkList"});
        }

        task.todoCheckList = todoCheckList;

        const completedCount = task.todoCheckList.filter(
            (item)=> item.completed
        ).length;

        const totalItems = task.todoCheckList.length;
        
        task.progress = totalItems > 0 ? Math.round((completedCount/totalItems)*100): 0 ;

        if(task.progress ===100){
            task.status="Completado";
        }else if (task.progress >0){
            task.status="En Proceso"
        }else{
            task.status="Pendiente"
        }
        
        await task.save();

        const updatedTask = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        res.json({message:"Task list actualizado", task:updateTask});
    } catch (error) {
        res.status(500).json({message:"Error Servidor:", error: error.message});
    }
};

const getDashboardData = async(req, res) =>{
    try {
        const totalTasks = await Task.countDocuments();
        const pendingTasks = await Task.countDocuments({status:"Pendiente"});
        const completedTasks = await Task.countDocuments({status:"Completado"});
        const overDueTasks = await Task.countDocuments({
            status:{$ne:"Completado"},
            dueDate:{$lt: new Date()}
        })

        const taskStatuses =["Pendiente", "En Proceso", "Completado"];
        const taskDistributionRaw = await Task.aggregate([
            {
                $group:{
                    _id: "$status",
                    count:{$sum:1}, 
                },
            },
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status)=>{
            const formattedKey= status.replace(/\s+/g,"");
            acc[formattedKey]=taskDistributionRaw.find((item) => item._id ===status)?.count || 0;
            return acc;

        },{});

        taskDistribution["All"] = totalTasks;

        const taskPriorities =["Alta", "Media", "Baja"];
        const taskPriorityLevelRaw = await Task.aggregate([
            {
                $group:{
                _id:"$priority",
                count:{$sum:1},
                 },
            },
        ])
        

        const taskPriorityLevels = taskPriorities.reduce((acc, priority)=>{
            acc[priority]= taskDistributionRaw.find((item)=> item._id === priority) ?.count || 0;
            return acc;
        },{});

        const recentTasks = await Task.find()
            .sort({createdAt:-1})
            .limit(10)
            .select("title status priority dueDate createdAt");

    
        res.status(200).json({
            statistics:{
                totalTasks,
                pendingTasks,
                completedTasks,
                overDueTasks,
            },
            charts:{
                taskDistribution,
                taskPriorityLevels
            },
            recentTasks,
        })


    } catch (error) {
        res.status(500).json({message:"Error Servidor:", error: error.message});
    }
};

const getUserDashboardData = async(req,res)=>{
    try {
        const userId = req.user._id;

        const totalTasks = await Task.countDocuments({assignedTo:userId});
        const pendingTasks = await Task.countDocuments({assignedTo:userId, status:"Pendiente"});
        const completedTasks = await Task.countDocuments({assignedTo:userId, status:"Completado"});

        const overDueTasks = await Task.countDocuments({
            assignedTo:userId,
            status:{$ne: "Completado"},
            dueDate:{$lt: new Date()},
        })


        const taskStatuses = ["Pendiente", "En Proceso", "Completado"];
        const taskDistributionRaw = await Task.aggregate([
            {$match:{assignedTo:userId}},
            {$group:{_id:"$status", count:{$sum:1}}},
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status)=>{
            const formattedKey = status.replace(/\s+/g, "");
            acc[formattedKey] = taskDistributionRaw.find((item)=> item._id === status)?.count || 0;
            return acc;
        },{})

        taskDistribution["All"] = totalTasks;

        const taskPriorities =["Baja","Media", "Alta"];
        const taskPriorityLevelRaw = await Task.aggregate([
            {$match:{assignedTo:userId}},
            {$group:{_id:"$status", count:{$sum:1}}},
        ]);

        const taskPriorityLevels = taskPriorities.reduce((acc, priority)=>{
            acc[priority]=taskPriorityLevelRaw.find((item)=> item._id === priority)?.count || 0;
            return acc;
        }, {});

        const recentTasks = await Task.find({assignedTo:userId})
            .sort({createAt:-1})
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics:{
                totalTasks,
                pendingTasks,
                completedTasks,
                overDueTasks
            },
            charts:{
                taskDistribution,
                taskPriorityLevels

            },
            recentTasks,
        })


        
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