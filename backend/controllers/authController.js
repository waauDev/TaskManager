const User = require("../models/User");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

// Crear Token
const generateToken = (userId)=>{
    return jwt.sign({id:userId}, process.env.JWT_SECRET, {expiresIn:"7d"});
};


const registerUser = async(req, res)=>{
    try {
        const {name, email, password, profileImageUrl, adminInviteToken}=req.body;

        // revisar si usuario ya existe
        const userExist= await User.findOne({email});

        if(userExist){
            return res.status(400).json({message:"Usuario ya se encuentra registrado"});
        }

        // role, administrador si token es correcto, de lo contrario member

        let role="member";

        if(
            adminInviteToken && 
            adminInviteToken == process.env.ADMIN_INVITE_TOKEN
        ){
            role="admin";
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(password, salt);

        // crear usuario

        const user = await User.create({
            name,
            email, 
            password:hashedPassword,
            profileImageUrl,
            role
        })

        // devolver data

        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
            profileImageUrl:user.profileImageUrl,
            token:generateToken(user._id),
        })

        
    } catch (error) {
        res.status(500).json({message:"Error Servidor", error:error.message})
    }

}


const loginUser = async(req, res) =>{
    try {

        const {email,password}= req.body;

        const user =await User.findOne({email});

        if(!user){
            res.status(401).json({message:"Usuario o contraseña invalido"});
        }

        // comparar password

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
             res.status(401).json({message:"Usuario o contraseña invalido"});
        }

         // devolver data

        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
            profileImageUrl:user.profileImageUrl,
            token:generateToken(user._id),
        })
        
    } catch (error) {
        res.status(500).json({message:"Erro Servidor", error:error.message})
    }

}

const getUserProfile = async(req, res)=>{
    try {
        
        const user = await User.findById(req.user.id).select("--password");

        if(!user){
            return res.status(404).json({message:"Usuario no encontrado"});
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({message:"Erro Servidor", error:error.message})
    }

}


const updateUserProfile = async(req, res)=>{
    try {
        const user = await User.findById(req.user.id);

        if(!user){
            return res.status(404).json({message:"Usuario no encontrado"});
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if(req.body.password){
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updateUser = await user.save();

        res.json({
            _id: updateUser._id,
            name:updateUser.name,
            email: updateUser.email,
            role: updateUser.role,
            token: generateToken(updateUser, _id),
        })
        
    } catch (error) {
        res.status(500).json({message:"Erro Servidor", error:error.message})
    }
    
}


module.exports = {registerUser,loginUser, getUserProfile, updateUserProfile};