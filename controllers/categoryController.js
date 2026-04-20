const CategoryModel = require("../models/category");
const ProductModel = require("../models/product");
const slugify = require("slugify");

class CategoryController {
  static normalizeName(value) {
    if (typeof value !== "string") return "";
    return value.replace(/\s+/g, " ").trim();
  }

  static async get(req, res) {
    try {
      const categories = await CategoryModel.findAll({
        order: [["id", "DESC"]],
      });
      res.status(200).json({
        status: 200,
        message: "Lấy danh sách thành công",
        data: categories,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.findByPk(id);

      if (!category) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      res.status(200).json({
        status: 200,
        data: category,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { name, description, status } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          message: "Tên không được để trống",
        });
      }

      const normalizedName = CategoryController.normalizeName(name);
      const categories = await CategoryModel.findAll({ attributes: ["id", "name"] });
      const existingName = categories.find(
        (item) => CategoryController.normalizeName(item.name) === normalizedName
      );
      if (existingName) {
        return res.status(400).json({ message: "Tên danh mục đã tồn tại" });
      }

      const slug = slugify(name, { lower: true, locale: "vi" });

      const category = await CategoryModel.create({
        name,
        description,
        slug,
        status,
      });

      res.status(201).json({
        message: "Thêm mới thành công",
        category,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, status } = req.body;

      const category = await CategoryModel.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      if (!name || name.trim() === "") {
        return res.status(400).json({
          message: "Tên không được để trống",
        });
      }

      const normalizedName = CategoryController.normalizeName(name);
      const categories = await CategoryModel.findAll({ attributes: ["id", "name"] });
      const existingName = categories.find(
        (item) => CategoryController.normalizeName(item.name) === normalizedName && item.id != id
      );
      if (existingName) {
        return res.status(400).json({ message: "Tên danh mục đã tồn tại" });
      }

      const slug = slugify(name, { lower: true, locale: "vi" });

      category.name = name;
      category.description = description;
      category.slug = slug;
      category.status = status;
      await category.save();

      res.status(200).json({
        message: "Cập nhật thành công",
        category,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const category = await CategoryModel.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      const product = await ProductModel.findOne({
        where: { category_id: id },
      });

      if (product) {
        return res.status(400).json({
          message: "Danh mục đang có sản phẩm, không thể xóa",
        });
      }

      await category.destroy();

      res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CategoryController;
