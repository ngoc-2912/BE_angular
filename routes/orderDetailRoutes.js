const express = require('express');
const router = express.Router();
const { checkJWT, isAdmin } = require('../controllers/authCheck')
const OrderDetailController = require('../controllers/orderDetailController');

router.get('/orderdetails/list', OrderDetailController.get);
router.get('/orderdetails/:id', OrderDetailController.getById);
router.get('/orderdetails/order/:orderId', OrderDetailController.getByOrderId);
router.post('/orderdetails/add', checkJWT, isAdmin, OrderDetailController.create);
router.put("/orderdetails/:id", checkJWT, isAdmin, OrderDetailController.update);
router.delete("/orderdetails/:id", checkJWT, isAdmin, OrderDetailController.delete);

module.exports = router;
