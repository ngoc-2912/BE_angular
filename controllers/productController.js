const ProductModel = require("../models/product");
const CategoryModel = require("../models/category");
const VariantModel = require("../models/variant"); // thêm nếu chưa có
const sequelize = require("../database");
const { QueryTypes } = require("sequelize");
const slugify = require("slugify");

class ProductController {
  // Helpers 

  static normalizeName(value) {
    if (typeof value !== "string") return "";
    return value.replace(/\s+/g, " ").trim();
  }

  static normalizeText(value) {
    if (typeof value !== "string") return "";
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
  }

  static isColorAttributeName(name) {
    const n = this.normalizeText(name);
    return ["mau", "mau sac", "color", "colour"].includes(n);
  }

  static isSizeAttributeName(name) {
    const n = this.normalizeText(name);
    return ["kich thuoc", "size"].includes(n);
  }

  // Nhận mảng variants thô, trả về variants có thêm color + size
  static async appendColorSize(variants) {
    if (!variants?.length) return variants;

    const variantIds = variants
      .map((v) => Number(v.id))
      .filter((id) => Number.isInteger(id) && id > 0);

    if (!variantIds.length) return variants;

    const rows = await sequelize.query(
      `SELECT vv.variant_id, av.value, a.name AS attribute_name
       FROM variant_values vv
       INNER JOIN attribute_values av ON av.id = vv.attribute_value_id
       INNER JOIN attributes a ON a.id = av.attribute_id
       WHERE vv.variant_id IN (:variantIds)`,
      { replacements: { variantIds }, type: QueryTypes.SELECT }
    );

    // Gom color/size theo variant_id
    const map = new Map();
    for (const row of rows) {
      const id = Number(row.variant_id);
      const entry = map.get(id) ?? { color: null, size: null };
      if (this.isColorAttributeName(row.attribute_name)) entry.color = row.value;
      if (this.isSizeAttributeName(row.attribute_name)) entry.size = row.value;
      map.set(id, entry);
    }

    return variants.map((v) => ({ ...v, ...(map.get(Number(v.id)) ?? { color: null, size: null }) }));
  }

  // CRUD 

  static async get(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 6;
      const offset = (page - 1) * limit;
      const isAdmin = req.query.isAdmin === "true";
      const whereCondition = isAdmin ? {} : { status: "1" };

      const { count, rows } = await ProductModel.findAndCountAll({
        where: whereCondition,
        include: [
          { model: CategoryModel, attributes: ["id", "name"] },
          { association: "variants" }, // 👈 thêm dòng này
        ],
        order: [["id", "DESC"]],
        limit,
        offset,
      });

      // Gắn color + size cho từng variant của mỗi product
      const data = await Promise.all(
        rows.map(async (product) => {
          const p = product.toJSON();
          p.variants = await ProductController.appendColorSize(p.variants ?? []);
          return p;
        })
      );

      res.status(200).json({
        status: 200,
        message: "Lấy danh sách thành công",
        data,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
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
          { model: CategoryModel, attributes: ["id", "name"] },
          { association: "variants", order: [["id", "DESC"]] },
        ],
      });

      if (!product) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      const p = product.toJSON();
      p.variants = await ProductController.appendColorSize(p.variants ?? []);

      res.status(200).json({ status: 200, data: p });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { name, description, short_description, price, image, category_id, status } = req.body;

      if (!image?.trim()) {
        return res.status(400).json({ status: 400, message: "Ảnh sản phẩm không được để trống" });
      }
      if (!price) {
        return res.status(400).json({ status: 400, message: "Giá không được để trống" });
      }
      if (price < 0) {
        return res.status(400).json({ status: 400, message: "Giá sản phẩm phải lớn hơn 0" });
      }
      if (!category_id) {
        return res.status(400).json({ status: 400, message: "category_id không được để trống" });
      }
      if (!name?.trim()) {
        return res.status(400).json({ status: 400, message: "Tên sản phẩm không được để trống" });
      }

      const category = await CategoryModel.findByPk(category_id);
      if (!category) {
        return res.status(404).json({ status: 404, message: "Id danh mục không tồn tại" });
      }

      const normalizedName = ProductController.normalizeName(name);
      const products = await ProductModel.findAll({ attributes: ["id", "name"] });
      const existingName = products.find(
        (item) => ProductController.normalizeName(item.name) === normalizedName
      );
      if (existingName) {
        return res.status(400).json({ status: 400, message: "Tên sản phẩm đã tồn tại" });
      }

      const slug = slugify(name, { lower: true, locale: "vi" });
      const product = await ProductModel.create({
        name, description, short_description, price, image, category_id, status, slug,
      });

      res.status(201).json({ message: "Thêm mới thành công", product });
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
        return res.status(404).json({ status: 404, message: "Id sản phẩm không tồn tại" });
      }
      if (!name?.trim()) {
        return res.status(400).json({ status: 400, message: "Tên không được để trống" });
      }
      if (!image?.trim()) {
        return res.status(400).json({ status: 400, message: "Ảnh sản phẩm không được để trống" });
      }
      if (price && price < 1000) {
        return res.status(400).json({ status: 400, message: "Giá sản phẩm phải lớn hơn 1000" });
      }
      if (!category_id) {
        return res.status(400).json({ status: 400, message: "category_id không được để trống" });
      }

      const category = await CategoryModel.findByPk(category_id);
      if (!category) {
        return res.status(404).json({ status: 404, message: "Id danh mục không tồn tại" });
      }

      const normalizedName = ProductController.normalizeName(name);
      const products = await ProductModel.findAll({ attributes: ["id", "name"] });
      const existingName = products.find(
        (item) => ProductController.normalizeName(item.name) === normalizedName && item.id != id
      );
      if (existingName) {
        return res.status(400).json({ status: 400, message: "Tên sản phẩm đã tồn tại" });
      }

      Object.assign(product, {
        name, description,
        short_description: short_description ?? product.short_description,
        price: price ?? product.price,
        image, category_id, status,
        slug: slugify(name, { lower: true, locale: "vi" }),
      });

      await product.save();
      res.status(200).json({ message: "Cập nhật thành công", product });
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