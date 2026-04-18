const VariantModel = require("../models/variant");
const ProductModel = require("../models/product");

class VariantController {
  static async get(req, res) {
    try {
      const variants = await VariantModel.findAll({
        include: [
          {
            model: ProductModel,
            attributes: ["id", "name"],
          },
        ],
        order: [["id", "DESC"]],
      });

      return res.status(200).json({
        status: 200,
        message: "Lấy danh sách thành công",
        data: variants,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const variant = await VariantModel.findByPk(id, {
        include: [
          {
            model: ProductModel,
            attributes: ["id", "name"],
          },
        ],
      });

      if (!variant) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      return res.status(200).json({
        status: 200,
        data: variant,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { product_id, name, sku, price, image } = req.body;

      if (product_id === undefined || product_id === null) {
        return res.status(400).json({
          status: 400,
          message: "product_id không được để trống",
        });
      }

      const product = await ProductModel.findByPk(product_id);
      if (!product) {
        return res.status(404).json({
          status: 404,
          message: "Id sản phẩm không tồn tại",
        });
      }

      if (!name || name.trim() === "") {
        return res.status(400).json({
          status: 400,
          message: "Tên variant không được để trống",
        });
      }

      const normalizedName = name.trim();

      const existingVariantName = await VariantModel.findOne({
        where: {
          product_id,
          name: normalizedName,
        },
      });

      if (existingVariantName) {
        return res.status(400).json({
          status: 400,
          message: "Variant đã tồn tại trong sản phẩm này",
        });
      }

      if (price === undefined || price === null || Number(price) < 0) {
        return res.status(400).json({
          status: 400,
          message: "Giá variant phải lớn hơn hoặc bằng 0",
        });
      }

      if (sku) {
        const existingSku = await VariantModel.findOne({ where: { sku } });
        if (existingSku) {
          return res.status(400).json({
            status: 400,
            message: "SKU đã tồn tại",
          });
        }
      }

      const variant = await VariantModel.create({
        product_id,
        name: normalizedName,
        sku: sku || null,
        price,
        image,
      });

      return res.status(201).json({
        message: "Thêm mới thành công",
        variant,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { product_id, name, sku, price, image } = req.body;

      const variant = await VariantModel.findByPk(id);
      if (!variant) {
        return res.status(404).json({
          status: 404,
          message: "Id variant không tồn tại",
        });
      }

      if (product_id !== undefined && product_id !== null) {
        const product = await ProductModel.findByPk(product_id);
        if (!product) {
          return res.status(404).json({
            status: 404,
            message: "Id sản phẩm không tồn tại",
          });
        }
      }

      if (name !== undefined && name.trim() === "") {
        return res.status(400).json({
          status: 400,
          message: "Tên variant không được để trống",
        });
      }

      if (price !== undefined && price !== null && Number(price) < 0) {
        return res.status(400).json({
          status: 400,
          message: "Giá variant phải lớn hơn hoặc bằng 0",
        });
      }

      if (name !== undefined) {
        const normalizedName = name.trim();
        const effectiveProductId =
          product_id !== undefined ? product_id : variant.product_id;

        const existingVariantName = await VariantModel.findOne({
          where: {
            product_id: effectiveProductId,
            name: normalizedName,
          },
        });

        if (existingVariantName && existingVariantName.id != id) {
          return res.status(400).json({
            status: 400,
            message: "Variant đã tồn tại trong sản phẩm này",
          });
        }
      }

      if (sku) {
        const existingSku = await VariantModel.findOne({ where: { sku } });
        if (existingSku && existingSku.id != id) {
          return res.status(400).json({
            status: 400,
            message: "SKU đã tồn tại",
          });
        }
      }

      if (product_id !== undefined) variant.product_id = product_id;
      if (name !== undefined) variant.name = name.trim();
      if (sku !== undefined) variant.sku = sku || null;
      if (price !== undefined) variant.price = price;
      if (image !== undefined) variant.image = image;

      await variant.save();

      return res.status(200).json({
        message: "Cập nhật thành công",
        variant,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const variant = await VariantModel.findByPk(id);
      if (!variant) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      await variant.destroy();

      return res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = VariantController;
