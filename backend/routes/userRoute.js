const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {getUsers, getUserById} = require("../controllers/userController");

const router = express.Router();

// Rutas de administracion de usuario

router.get("/", protect, adminOnly,getUsers);
router.get("/:id", protect, getUserById);

module.exports = router;