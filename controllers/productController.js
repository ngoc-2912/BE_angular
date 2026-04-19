const ProductModel = require("../models/product");
const CategoryModel = require("../models/category");
const sequelize = require("../database");
const { QueryTypes } = require("sequelize");
const slugify = require("slugify");

class ProductController {
 static normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
 }

 static isColorAttributeName(name) {
  const normalized = this.normalizeText(name);
  return normalized === "mau" || normalized === "mau sac" || normalized === "color" || normalized === "colour";
 }

 static isSizeAttributeName(name) {
  const normalized = this.normalizeText(name);
  return normalized === "kich thuoc" || normalized === "size";
 }

 static async appendColorSize(variants) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return variants;
  }

  const variantIds = variants
    .map((item) => Number(item.id))
    .filter((variantId) => Number.isInteger(variantId) && variantId > 0);

  if (variantIds.length === 0) {
    return variants;
  }

  const rows = await sequelize.query(
    `
      SELECT vv.variant_id, av.value, a.name AS attribute_name
      FROM variant_values vv
      INNER JOIN attribute_values av ON av.id = vv.attribute_value_id
      INNER JOIN attributes a ON a.id = av.attribute_id
      WHERE vv.variant_id IN (:variantIds)
      `,
    {
      replacements: { variantIds },
      type: QueryTypes.SELECT,
    },
  );

  const valueMap = new Map();

  for (const row of rows) {
    const variantId = Number(row.variant_id);
    const entry = valueMap.get(variantId) ?? { color: null, size: null };

    if (ProductController.isColorAttributeName(row.attribute_name)) {
      entry.color = row.value;
    }

    if (ProductController.isSizeAttributeName(row.attribute_name)) {
      entry.size = row.value;
    }

    valueMap.set(variantId, entry);
  }

  return variants.map((item) => {
    const resolved = valueMap.get(Number(item.id)) ?? { color: null, size: null };

    return {
      ...item,
      color: resolved.color,
      size: resolved.size,
    };
  });
 }

 static async get(req, res) {
  try {
    // Lấy page từ query, mặc định là trang 1, mỗi trang 6 sản phẩm
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const offset = (page - 1) * limit;76

    const { count, rows } = await ProductModel.findAndCountAll({
      include: [
        {
          model: CategoryModel,
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "DESC"]],
      limit: limit,
      offset: offset,
    });

    res.status(200).json({
      status: 200,
      message: "Lấy danh sách thành công",
      data: rows, // Danh sách sản phẩm của trang hiện tại
      totalItems: count, // Tổng số sản phẩm trong DB
      totalPages: Math.ceil(count / limit), // Tổng số trang
      currentPage: page
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
          {
            association: "variants",
            order: [["id", "DESC"]],
          },
        ],
      });

      if (!product) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      const hydratedVariants = await ProductController.appendColorSize(
        (product.variants || []).map((variant) => variant.toJSON()),
      );

      const productData = product.toJSON();
      productData.variants = hydratedVariants;

      res.status(200).json({
        status: 200,
        data: productData,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { name, description, short_description, price, image, category_id, status } = req.body;

      if (!image || !String(image).trim()) {
        return res.status(400).json({
          status: 400,
          message: "Ảnh sản phẩm không được để trống",
        });
      }

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
        short_description,
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
      const { name, description, short_description, price, image, category_id, status } = req.body;

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

      if (!image || !String(image).trim()) {
        return res.status(400).json({
          status: 400,
          message: "Ảnh sản phẩm không được để trống",
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
      if (short_description !== undefined) product.short_description = short_description;
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
