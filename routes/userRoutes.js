const express = require("express");
const UserController = require("../controllers/userController");
const { checkJWT, isAdmin } = require("../controllers/authCheck");

const router = express.Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/list", UserController.get);
router.get("/:id", UserController.getById);
router.post("/check-email", UserController.checkEmail);
router.put("/:id", checkJWT, isAdmin, UserController.updateActive);
router.post("/admin-register", checkJWT, isAdmin, UserController.registerAdmin);
module.exports = router;
