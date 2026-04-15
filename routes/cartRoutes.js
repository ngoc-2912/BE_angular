const express = require("express");
const router = express.Router();
const CartController = require("../controllers/cartController");
const { checkJWT } = require("../controllers/authCheck");

router.get("/carts/list", checkJWT, CartController.get);
router.get("/carts/user/:userId", CartController.getByUserId);
router.get("/carts/:id", CartController.getById);
router.post("/carts/add", CartController.create);
router.delete("/carts/:id", CartController.delete);

module.exports = router;