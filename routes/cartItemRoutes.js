const express = require("express");
const router = express.Router();
const CartItemController = require("../controllers/cartItemController");

router.get("/cart-items/list", CartItemController.get);
router.get("/cart-items/:id", CartItemController.getById);
router.post("/cart-items/add", CartItemController.addToCart);
router.put("/cart-items/:id", CartItemController.update);
router.delete("/cart-items/:id", CartItemController.delete);

module.exports = router;