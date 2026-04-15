const ProductModel = require("../models/product");
const CategoryModel = require("../models/category");
const slugify = require("slugify");

class ProductController {
  static async get(req, res) {
    try {
      const products = await ProductModel.findAll({
        include: [
          {
            model: CategoryModel,
            attributes: ["id", "name"],
          },
        ],
        order: [["id", "DESC"]],
      });
      res.status(200).json({
        status: 200,
        message: "Lấy danh sách thành công",
        data: products,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const product = await ProductModel.findByPk(id, {
        include: [
          {
            model: CategoryModel,
            attributes: ["id", "name"],
          },
        ],
      });

      if (!product) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      res.status(200).json({
        status: 200,
        data: product,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { name, description, price, image, category_id, status } = req.body;

      if (!price) {
        return res.status(400).json({
          status: 400,
          message: "Giá không được để trống",
        });
      }

      if (price < 0) {
        return res.status(400).json({
          status: 400,
          message: "Giá sản phẩm phải lớn hơn 0",
        });
      }

      if (category_id) {
        const category = await CategoryModel.findByPk(category_id);
        if (!category) {
          return res.status(404).json({
            status: 404,
            message: "Id danh mục không tồn tại",
          });
        }
      }

      if (category_id === null || category_id === undefined) {
        return res.status(400).json({
          status: 400,
          message: "category_id không được để trống",
        });
      }

      if (name.trim() === "") {
        return res.status(400).json({
          status: 400,
          message: "Tên sản phẩm không được để trống",
        });
      }

      const existingName = await ProductModel.findOne({ where: { name } });
      if (existingName) {
        return res.status(400).json({
          status: 400,
          message: "Tên sản phẩm đã tồn tại"
        });
      }

      const slug = slugify(name, { lower: true, locale: "vi" });

      const product = await ProductModel.create({
        name,
        description,
        price,
        image,
        category_id,
        status,
        slug,
      });

      res.status(201).json({
        message: "Thêm mới thành công",
        product,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, image, category_id, status } = req.body;

      const product = await ProductModel.findByPk(id);
      if (!product) {
        return res.status(404).json({
          status: 404,
          message: "Id sản phẩm không tồn tại"
        });
      }

      if (!name || name.trim() === "") {
        return res.status(400).json({
          status: 400,
          message: "Tên không được để trống",
        });
      }

      if (price && price < 1000) {
        return res.status(400).json({
          status: 400,
          message: "Giá sản phẩm phải lớn hơn 1000",
        });
      }

      if (category_id) {
        const category = await CategoryModel.findByPk(category_id);
        if (!category) {
          return res.status(404).json({
            status: 404,
            message: "Id danh mục không tồn tại",
          });
        }
      }

      if (category_id === null || category_id === undefined) {
        return res.status(400).json({
          status: 400,
          message: "category_id không được để trống",
        });
      }

      const existingName = await ProductModel.findOne({ where: { name } });
      if (existingName && existingName.id != id) {
        return res.status(400).json({
          status: 400,
          message: "Tên sản phẩm đã tồn tại"
        });
      }

      const slug = slugify(name, { lower: true, locale: "vi" });
      

      if (name) product.name = name;
      if (description) product.description = description;
      if (price) product.price = price;
      if (image) product.image = image;
      if (category_id) product.category_id = category_id;
      if (status) product.status = status;
      product.slug = slug;
      await product.save();

      res.status(200).json({
        message: "Cập nhật thành công",
        product,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const product = await ProductModel.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      await product.destroy();

      res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProductController;
