const VariantModel = require("../models/variant");
const ProductModel = require("../models/product");
const AttributeModel = require("../models/attribute");
const AttributeValueModel = require("../models/attributeValue");
const VariantValueModel = require("../models/variantValue");
const sequelize = require("../database");
const { QueryTypes, Op } = require("sequelize");

const COLOR_NAMES = ["màu", "màu sắc", "mau", "mau sac", "color", "colour"];
const SIZE_NAMES = ["kích thước", "kich thuoc", "size"];

function normalizeText(str) {
  return (str ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function isColorAttribute(name) {
  return COLOR_NAMES.includes(normalizeText(name));
}

function isSizeAttribute(name) {
  return SIZE_NAMES.includes(normalizeText(name));
}

async function getOrCreateAttribute(name, transaction) {
  const trimmedName = name?.trim();
  if (!trimmedName) throw new Error("Tên attribute không được để trống");

  const [attribute] = await AttributeModel.findOrCreate({
    where: { name: trimmedName },
    defaults: { name: trimmedName },
    transaction,
  });

  return attribute;
}

async function getOrCreateAttributeValue(attributeId, value, transaction) {
  const trimmedValue = value?.trim();
  if (!trimmedValue) throw new Error("Giá trị attribute không được để trống");

  const [attributeValue] = await AttributeValueModel.findOrCreate({
    where: { attribute_id: attributeId, value: trimmedValue },
    defaults: { attribute_id: attributeId, value: trimmedValue },
    transaction,
  });

  return attributeValue;
}

async function attachColorSize(variants) {
  if (!variants?.length) return variants;

  const variantIds = variants.map((v) => v.id).filter(Number.isInteger);
  if (!variantIds.length) return variants;

  const rows = await sequelize.query(
    `SELECT vv.variant_id, av.value, a.name AS attr_name
     FROM variant_values vv
     JOIN attribute_values av ON av.id = vv.attribute_value_id
     JOIN attributes a ON a.id = av.attribute_id
     WHERE vv.variant_id IN (:variantIds)`,
    { replacements: { variantIds }, type: QueryTypes.SELECT },
  );

  const colorSizeMap = new Map();

  for (const row of rows) {
    const entry = colorSizeMap.get(row.variant_id) ?? {
      color: null,
      size: null,
    };
    if (isColorAttribute(row.attr_name)) entry.color = row.value;
    if (isSizeAttribute(row.attr_name)) entry.size = row.value;
    colorSizeMap.set(row.variant_id, entry);
  }

  return variants.map((variant) => ({
    ...variant,
    ...(colorSizeMap.get(variant.id) ?? { color: null, size: null }),
  }));
}

async function replaceColorOrSize(
  variantId,
  attributeName,
  newValue,
  transaction,
) {
  const attribute = await getOrCreateAttribute(attributeName, transaction);

  const existingValues = await AttributeValueModel.findAll({
    where: { attribute_id: attribute.id },
    attributes: ["id"],
    transaction,
  });

  if (existingValues.length) {
    await VariantValueModel.destroy({
      where: {
        variant_id: variantId,
        attribute_value_id: existingValues.map((v) => v.id),
      },
      transaction,
    });
  }

  const trimmedValue = newValue?.trim();
  if (!trimmedValue) return;

  const attributeValue = await getOrCreateAttributeValue(
    attribute.id,
    trimmedValue,
    transaction,
  );

  await VariantValueModel.findOrCreate({
    where: { variant_id: variantId, attribute_value_id: attributeValue.id },
    defaults: { variant_id: variantId, attribute_value_id: attributeValue.id },
    transaction,
  });
}

class VariantController {
  static async get(req, res) {
    try {
      const variants = await VariantModel.findAll({
        include: [{ model: ProductModel, attributes: ["id", "name"] }],
        order: [["id", "DESC"]],
      });

      const data = await attachColorSize(variants.map((v) => v.toJSON()));
      return res.json({
        status: 200,
        message: "Lấy danh sách thành công",
        data,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getById(req, res) {
    try {
      const variant = await VariantModel.findByPk(req.params.id, {
        include: [{ model: ProductModel, attributes: ["id", "name"] }],
      });

      if (!variant)
        return res.status(404).json({ message: "Id không tồn tại" });

      const [data] = await attachColorSize([variant.toJSON()]);
      return res.json({ status: 200, data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const {
        product_id,
        name,
        sku,
        price,
        image,
        attribute_value_ids,
        attributes,
        color,
        size,
      } = req.body;

      if (!product_id)
        return res
          .status(400)
          .json({ message: "product_id không được để trống" });

      if (!(await ProductModel.findByPk(product_id)))
        return res.status(404).json({ message: "Id sản phẩm không tồn tại" });

      if (!name?.trim())
        return res
          .status(400)
          .json({ message: "Tên variant không được để trống" });

      if (price == null || Number(price) < 0)
        return res
          .status(400)
          .json({ message: "Giá variant phải lớn hơn hoặc bằng 0" });

      if (!image || !String(image).trim()) {
        return res.status(400).json({
          message: "Ảnh biến thể không được để trống",
        });
      }

      const trimmedName = name.trim();

      if (
        await VariantModel.findOne({ where: { product_id, name: trimmedName } })
      )
        return res
          .status(400)
          .json({ message: "Variant đã tồn tại trong sản phẩm này" });

      if (sku && (await VariantModel.findOne({ where: { sku } })))
        return res.status(400).json({ message: "SKU đã tồn tại" });

      const result = await sequelize.transaction(async (t) => {
        const attributeValueIds = new Set();

        for (const id of attribute_value_ids ?? []) {
          const num = Number(id);
          if (Number.isInteger(num) && num > 0) attributeValueIds.add(num);
        }

        for (const item of attributes ?? []) {
          const attrName = item.attribute_name?.trim();
          const value = item.value?.trim();
          if (!attrName || !value)
            throw new Error("Attributes phải có attribute_name và value");

          const attribute = await getOrCreateAttribute(attrName, t);
          const attributeValue = await getOrCreateAttributeValue(
            attribute.id,
            value,
            t,
          );
          attributeValueIds.add(attributeValue.id);
        }

        if (color?.trim()) {
          const attribute = await getOrCreateAttribute("Màu sắc", t);
          const attributeValue = await getOrCreateAttributeValue(
            attribute.id,
            color.trim(),
            t,
          );
          attributeValueIds.add(attributeValue.id);
        }

        if (size?.trim()) {
          const attribute = await getOrCreateAttribute("Kích thước", t);
          const attributeValue = await getOrCreateAttributeValue(
            attribute.id,
            size.trim(),
            t,
          );
          attributeValueIds.add(attributeValue.id);
        }

        if (!attributeValueIds.size)
          throw new Error("Variant phải có attributes");

        const newVariant = await VariantModel.create(
          { product_id, name: trimmedName, sku: sku || null, price, image },
          { transaction: t },
        );

        await VariantValueModel.bulkCreate(
          [...attributeValueIds].map((attrValueId) => ({
            variant_id: newVariant.id,
            attribute_value_id: attrValueId,
          })),
          { transaction: t },
        );

        return { newVariant, attributeValueIds: [...attributeValueIds] };
      });

      return res.status(201).json({
        message: "Thêm mới thành công",
        attribute_value_ids: result.attributeValueIds,
        variant: {
          ...result.newVariant.toJSON(),
          color: color?.trim() || null,
          size: size?.trim() || null,
        },
      });
    } catch (err) {
      const isBadRequest = [
        "attribute",
        "Attributes",
        "Variant",
        "phải",
        "SKU",
      ].some((k) => err.message.includes(k));
      return res
        .status(isBadRequest ? 400 : 500)
        .json({ message: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { product_id, name, sku, price, image, color, size } = req.body;

      const variant = await VariantModel.findByPk(id);
      if (!variant)
        return res.status(404).json({ message: "Id variant không tồn tại" });

      if (product_id && !(await ProductModel.findByPk(product_id)))
        return res.status(404).json({ message: "Id sản phẩm không tồn tại" });

      if (name !== undefined && !name.trim())
        return res
          .status(400)
          .json({ message: "Tên variant không được để trống" });

      if (price !== undefined && Number(price) < 0)
        return res
          .status(400)
          .json({ message: "Giá variant phải lớn hơn hoặc bằng 0" });

      if (!image || !String(image).trim()) {
        return res.status(400).json({
          message: "Ảnh biến thể không được để trống",
        });
      }

      if (name !== undefined) {
        const duplicate = await VariantModel.findOne({
          where: {
            product_id: product_id ?? variant.product_id,
            name: name.trim(),
            id: { [Op.ne]: id },
          },
        });
        if (duplicate)
          return res
            .status(400)
            .json({ message: "Variant đã tồn tại trong sản phẩm này" });
      }

      if (sku) {
        const duplicate = await VariantModel.findOne({
          where: { sku, id: { [Op.ne]: id } },
        });
        if (duplicate)
          return res.status(400).json({ message: "SKU đã tồn tại" });
      }

      if (product_id !== undefined) variant.product_id = product_id;
      if (name !== undefined) variant.name = name.trim();
      if (sku !== undefined) variant.sku = sku || null;
      if (price !== undefined) variant.price = price;
      if (image !== undefined) variant.image = image;
      await variant.save();

      if (color !== undefined || size !== undefined) {
        await sequelize.transaction(async (t) => {
          if (color !== undefined)
            await replaceColorOrSize(Number(id), "Màu sắc", color, t);
          if (size !== undefined)
            await replaceColorOrSize(Number(id), "Kích thước", size, t);
        });
      }

      const [data] = await attachColorSize([variant.toJSON()]);
      return res.json({ message: "Cập nhật thành công", variant: data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const variant = await VariantModel.findByPk(req.params.id);
      if (!variant)
        return res.status(404).json({ message: "Id không tồn tại" });

      await variant.destroy();
      return res.json({ message: "Xóa thành công" });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = VariantController;
