const CartItemModel = require("../models/cartItem");
const CartModel = require("../models/cart");
const ProductModel = require("../models/product");
const VariantModel = require("../models/variant");
const { Op } = require("sequelize");

class CartItemController {
  static formatCartItem(cartItem) {
    const item = cartItem?.toJSON ? cartItem.toJSON() : cartItem;
    const variantProductName = item.Variant?.Product?.name ?? null;
    const variantName = item.Variant?.name ?? null;
    const { Product, Variant, ...rest } = item;

    return {
      ...rest,
      name: item.variant_id
        ? [variantProductName, variantName].filter(Boolean).join(" - ") || variantName
        : item.Product?.name ?? null,
      image: item.variant_id ? item.Variant?.image ?? null : item.Product?.image ?? null,
    };
  }
  static async get(req, res) {
    try {
      const cartItems = await CartItemModel.findAll({
        include: [
          {
            model: CartModel,
            attributes: ["id", "user_id"],
          },
          {
            model: ProductModel,
            attributes: ["id", "name", "price", "image"],
          },
          {
            model: VariantModel,
            attributes: ["id", "product_id", "name", "price", "image"],
            include: [
              {
                model: ProductModel,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
        order: [["id", "DESC"]],
      });

      return res.status(200).json({
        status: 200,
        message: "Lấy danh sách thành công",
        data: cartItems.map((item) => CartItemController.formatCartItem(item)),
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const cartItem = await CartItemModel.findByPk(id, {
        include: [
          {
            model: CartModel,
            attributes: ["id", "user_id"],
          },
          {
            model: ProductModel,
            attributes: ["id", "name", "price", "image"],
          },
          {
            model: VariantModel,
            attributes: ["id", "product_id", "name", "price", "image"],
            include: [
              {
                model: ProductModel,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });

      if (!cartItem) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      return res.status(200).json({
        status: 200,
        data: CartItemController.formatCartItem(cartItem),
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async addToCart(req, res) {
    try {
      const { cart_id, product_id, variant_id, quantity, price } = req.body;

      if (!cart_id || quantity === undefined || quantity === null || price === undefined || price === null) {
        return res.status(400).json({
          status: 400,
          message: "Tất cả trường dữ liệu không được trống",
        });
      }

      const hasProductId = product_id !== undefined && product_id !== null;
      const hasVariantId = variant_id !== undefined && variant_id !== null;

      if (hasProductId === hasVariantId) {
        return res.status(400).json({
          status: 400,
          message: "Chỉ được truyền product_id hoặc variant_id",
        });
      }

      if (quantity <= 0) {
        return res.status(400).json({
          status: 400,
          message: "Số lượng phải lớn hơn 0",
        });
      }

      if (price < 0) {
        return res.status(400).json({
          status: 400,
          message: "Giá tiền phải lớn hơn 0",
        });
      }

      const cart = await CartModel.findByPk(cart_id);
      if (!cart) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      let resolvedProductId = null;
      let resolvedVariantId = null;

      if (hasProductId) {
        const product = await ProductModel.findByPk(product_id);
        if (!product) {
          return res.status(404).json({ message: "Id sản phẩm không tồn tại" });
        }

        resolvedProductId = product.id;
      } else {
        const variant = await VariantModel.findByPk(variant_id);
        if (!variant) {
          return res.status(404).json({ message: "Id variant không tồn tại" });
        }

        resolvedVariantId = variant.id;
      }

      const existingCartItem = await CartItemModel.findOne({
        where: {
          cart_id,
          product_id: resolvedProductId,
          variant_id: resolvedVariantId,
        },
      });

      if (existingCartItem) {
        existingCartItem.quantity = Number(existingCartItem.quantity) + Number(quantity);
        await existingCartItem.save();

        return res.status(200).json({
          message: "Đã cập nhật số lượng sản phẩm trong giỏ hàng",
          cartItem: existingCartItem,
        });
      }

      const cartItem = await CartItemModel.create({
        cart_id,
        product_id: resolvedProductId,
        variant_id: resolvedVariantId,
        quantity,
        price,
      });

      const formattedItem = await CartItemModel.findByPk(cartItem.id, {
        include: [
          { model: ProductModel, attributes: ["id", "name", "image"] },
          {
            model: VariantModel,
            attributes: ["id", "product_id", "name", "image"],
            include: [
              {
                model: ProductModel,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });

      return res.status(201).json({
        message: "Thêm mới thành công",
        cartItem: CartItemController.formatCartItem(formattedItem),
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const cartItem = await CartItemModel.findByPk(id);
      if (!cartItem) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      if (quantity === undefined || quantity === null) {
        return res.status(400).json({
          status: 400,
          message: "Số lượng không được để trống",
        });
      }

      if (quantity <= 0) {
        return res.status(400).json({
          status: 400,
          message: "Số lượng phải lớn hơn 0",
        });
      }

      const existingCartItem = await CartItemModel.findOne({
        where: {
          cart_id: cartItem.cart_id,
          product_id: cartItem.product_id,
          id: { [Op.ne]: id },
        },
      });

      if (existingCartItem) {
        existingCartItem.quantity = quantity;
        await existingCartItem.save();
        await cartItem.destroy();

        return res.status(200).json({
          message: "Đã cập nhật số lượng sản phẩm trong giỏ hàng",
          cartItem: existingCartItem,
        });
      }

      cartItem.quantity = quantity;

      await cartItem.save();

      return res.status(200).json({
        message: "Cập nhật thành công",
        cartItem,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const cartItem = await CartItemModel.findByPk(id);
      if (!cartItem) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      await cartItem.destroy();

      return res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CartItemController;