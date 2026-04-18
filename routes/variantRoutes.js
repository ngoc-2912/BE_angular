const express = require("express");
const router = express.Router();
const { checkJWT, isAdmin } = require("../controllers/authCheck");
const VariantController = require("../controllers/variantController");

router.get("/variants/list", VariantController.get);
router.get("/variants/:id", VariantController.getById);
router.post("/variants/add", checkJWT, isAdmin, VariantController.create);
router.put("/variants/:id", checkJWT, isAdmin, VariantController.update);
router.delete("/variants/:id", checkJWT, isAdmin, VariantController.delete);

module.exports = router;
