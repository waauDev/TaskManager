const jwt = require("jsonwebtoken");
const User = require("../models/User");


// Middleware para proteger rutas

const protect = async(req,res, next)=>{
    try{
        let token = req.headers.authorization;

        if(token && token.startsWith("Bearer")){
            token = token.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        }else{
            res.status(401).json({message:"No Autorizado, No hay token"})
        }

    }catch(error){
        res.status(401).json({message:"Token Invalido", error:error.message})
    }
}

// Middlware para acceso del administrador

const adminOnly=(req, res, next)=>{
    if(req.user && req.user.role==="admin"){
        next();
    }else{
        res.status(403).json({message:"Acceso denagado, solo administradores"});
    }
};

module.exports ={protect, adminOnly};