const mongoose= require("mongoose");

const todoSchema = new mongoose.Schema({
    text:{type:String, required:true},
    completed:{type:Boolean, default:false}
})

const taskSchema = new mongoose.Schema(
    {
    title:{type:String},
    description:{type:String},
    priority:{type:String, enum:["Alta", "Media", "Baja"], default:"Alta"},
    status:{type:String, enum:["Pendiente", "En Proceso", "Completado"], default:"Pendiente"},
    dueDate:{type:Date, required:true},
    assignedTo:[{type:mongoose.Schema.Types.ObjectId, ref:"User"}],
    createdBy:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    attachments:[{type:String}],
    todoCheckList:[todoSchema],
    progress:{type:Number, default:0}
    },

    {timestamps:true}
);

module.exports = mongoose.model("Task", taskSchema);