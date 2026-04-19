const express = require('express');
const router = express.Router();
const { checkJWT, isAdmin } = require('../controllers/authCheck')
const OrderController = require('../controllers/orderController');

router.get('/orders/list', OrderController.get);
router.get('/orders/:id', OrderController.getById);
router.post('/orders/add', checkJWT, OrderController.create);
router.put("/orders/:id", checkJWT, OrderController.update);
router.delete("/orders/:id", checkJWT, isAdmin, OrderController.delete);

module.exports = router;
