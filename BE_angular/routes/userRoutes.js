const express = require('express');
const UserController = require('../controllers/userController');
const { checkJWT, isAdmin } = require('../controllers/authCheck');

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/list', checkJWT, isAdmin, UserController.get);
router.get('/:id', checkJWT, isAdmin, UserController.getById);
router.put('/:id', checkJWT, isAdmin, UserController.updateActive);

module.exports = router;
