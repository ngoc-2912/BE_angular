const CartModel = require("../models/cart");
const UserModel = require("../models/user");
const CartItemModel = require("../models/cartItem");

class CartController {
  static async get(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Token không hợp lệ!" });
      }

      const cart = await CartModel.findOne({
        where: { user_id: userId },
        include: [
          {
            model: CartItemModel,
            attributes: ["id", "cart_id", "product_id", "quantity", "price"],
          },
        ],
      });

      if (!cart) {
        return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
      }

      return res.status(200).json({
        status: 200,
        message: "Lấy danh sách thành công",
        data: cart,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const cart = await CartModel.findByPk(id, {
        include: [
          {
            model: UserModel,
            attributes: ["id", "full_name", "email"],
          },
          {
            model: CartItemModel,
            attributes: ["id", "cart_id", "product_id", "quantity", "price"],
          },
        ],
      });

      if (!cart) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      return res.status(200).json({
        status: 200,
        data: cart,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getByUserId(req, res) {
    try {
      const { userId } = req.params;

      const cart = await CartModel.findOne({
        where: { user_id: userId },
        include: [
          {
            model: UserModel,
            attributes: ["id", "full_name", "email"],
          },
          {
            model: CartItemModel,
            attributes: ["id", "cart_id", "product_id", "quantity", "price"],
          },
        ],
      });

      if (!cart) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      return res.status(200).json({
        status: 200,
        data: cart,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({
          status: 400,
          message: "user_id không được để trống",
        });
      }

      const user = await UserModel.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      const existingCart = await CartModel.findOne({ where: { user_id } });
      if (existingCart) {
        return res.status(400).json({
          status: 400,
          message: "Giỏ hàng của user này đã tồn tại",
          cart: existingCart,
        });
      }

      const cart = await CartModel.create({ user_id });

      return res.status(201).json({
        message: "Thêm mới thành công",
        cart,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const cart = await CartModel.findByPk(id);
      if (!cart) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      await cart.destroy();

      return res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CartController;