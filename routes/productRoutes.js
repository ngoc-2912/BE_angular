const express = require('express');
const router = express.Router();
const { checkJWT, isAdmin } = require('../controllers/authCheck')
const ProductController = require('../controllers/productController');

router.get('/products/list', ProductController.get); // GET /api/products?page=1
router.get('/products/:id', ProductController.getById); // GET /api/products/:id
router.post('/products/add', checkJWT, isAdmin, ProductController.create); // POST /api/products
router.put('/products/:id', checkJWT, isAdmin, ProductController.update); // PUT /api/products/:id
router.delete('/products/:id', checkJWT, isAdmin, ProductController.delete); // DELETE /api/products/:id

module.exports = router;
