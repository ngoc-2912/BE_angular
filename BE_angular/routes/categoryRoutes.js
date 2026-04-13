const express = require('express');
const router = express.Router();
const { checkJWT, isAdmin } = require('../controllers/authCheck')
const CategoryController = require('../controllers/categoryController');

router.get('/categories/list', checkJWT, isAdmin, CategoryController.get);
router.get('/categories/:id', checkJWT, isAdmin, CategoryController.getById);
router.post('/categories/add', checkJWT, isAdmin, CategoryController.create);
router.put("/categories/:id", checkJWT, isAdmin, CategoryController.update);
router.delete("/categories/:id", checkJWT, isAdmin, CategoryController.delete);
module.exports = router;