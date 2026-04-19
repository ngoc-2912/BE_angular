const OrderModel = require("../models/order");
const UserModel = require("../models/user");
const OrderDetailModel = require("../models/orderDetail");
const ProductModel = require("../models/product");
const VariantModel = require("../models/variant");

const VALID_STATUSES = [0, 1, 2, 3];
const STATUS_TO_ENUM_VALUE = {
  pending: "0",
  confirmed: "1",
  shipping: "2",
  completed: "3",
};

const normalizeStatusToEnumValue = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const numericStatus = Number(value);
  if (Number.isInteger(numericStatus) && VALID_STATUSES.includes(numericStatus)) {
    return String(numericStatus);
  }

  if (typeof value === "string") {
    const label = value.trim().toLowerCase();
    return STATUS_TO_ENUM_VALUE[label] || null;
  }

  return null;
};

class OrderController {
  static formatOrderDetail(orderDetail) {
    const item = orderDetail?.toJSON ? orderDetail.toJSON() : orderDetail;
    const variantProductName = item.Variant?.Product?.name ?? null;
    const variantName = item.Variant?.name ?? null;
    const { Product, Variant, ...rest } = item;

    return {
      ...rest,
      name: item.variant_id
        ? [variantProductName, variantName].filter(Boolean).join(" - ") || item.name || variantName || null
        : item.Product?.name ?? item.name ?? null,
    };
  }

  static async get(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 5;
      const offset = (page - 1) * limit;

      const { count, rows } = await OrderModel.findAndCountAll({
        include: [
          {
            model: UserModel,
            attributes: ["id", "full_name", "email"],
          },
          {
            model: OrderDetailModel,
            attributes: ["id", "product_id", "variant_id", "quantity", "price", "name"],
            include: [
              {
                model: ProductModel,
                attributes: ["id", "name"],
              },
              {
                model: VariantModel,
                attributes: ["id", "product_id", "name"],
                include: [
                  {
                    model: ProductModel,
                    attributes: ["id", "name"],
                  },
                ],
              },
            ],
          },
        ],
        order: [["id", "DESC"]],
        limit: limit,
        offset: offset,
      });

      const formattedRows = rows.map((order) => {
        const orderData = order.toJSON();
        orderData.OrderDetails = (orderData.OrderDetails || []).map((item) =>
          OrderController.formatOrderDetail(item),
        );
        return orderData;
      });

      res.status(200).json({
        status: 200,
        message: "Lấy danh sách thành công",
        data: formattedRows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const order = await OrderModel.findByPk(id, {
        include: [
          {
            model: UserModel,
            attributes: ["id", "full_name", "email"],
          },
          {
            model: OrderDetailModel,
            attributes: ["id", "product_id", "variant_id", "quantity", "price", "name"],
            include: [
              {
                model: ProductModel,
                attributes: ["id", "name"],
              },
              {
                model: VariantModel,
                attributes: ["id", "product_id", "name"],
                include: [
                  {
                    model: ProductModel,
                    attributes: ["id", "name"],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!order) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      const formattedOrder = order.toJSON();
      formattedOrder.OrderDetails = (formattedOrder.OrderDetails || []).map((item) =>
        OrderController.formatOrderDetail(item),
      );

      res.status(200).json({
        status: 200,
        data: formattedOrder,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { full_name, email, phone, address, payment_method, note, total_price, status } = req.body;
      const user_id = req.user?.id;

      const code = "ORD-" + Date.now();

      if (!user_id) {
        return res.status(401).json({ message: "Token không hợp lệ!" });
      }

      if (!full_name || !email || !phone || !address || !payment_method) {
        return res.status(400).json({
          status: 400,
          message: "Thông tin người nhận không được để trống",
        });
      }

      if (!total_price) {
        return res.status(400).json({
          status: 400,
          message: "Tổng giá tiền không được trống",
        });
      }

      if (total_price < 0) {
        return res.status(400).json({
          status: 400,
          message: "Tổng giá tiền phải lớn hơn 0",
        });
      }

      const user = await UserModel.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      const normalizedStatus =
        status === undefined || status === null
          ? "0"
          : normalizeStatusToEnumValue(status);

      if (!normalizedStatus) {
        return res.status(400).json({
          status: 400,
          message: "Trạng thái không hợp lệ",
        });
      }

      const order = await OrderModel.create({
        full_name,
        email,
        phone,
        address,
        payment_method,
        note,
        user_id,
        code,
        total_price,
        status: normalizedStatus,
      });

      res.status(201).json({
        message: "Thêm mới thành công",
        order,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { full_name, email, phone, address, payment_method, note, total_price, status } = req.body;

      const order = await OrderModel.findByPk(id);
      if (!order) {
        return res.status(404).json({ message: "Đơn hàng không tồn tại" });
      }

      if (total_price !== undefined && total_price < 0) {
        return res.status(400).json({
          status: 400,
          message: "Tổng giá tiền phải lớn hơn 0",
        });
      }

      if (full_name !== undefined) order.full_name = full_name;
      if (email !== undefined) order.email = email;
      if (phone !== undefined) order.phone = phone;
      if (address !== undefined) order.address = address;
      if (payment_method !== undefined) order.payment_method = payment_method;
      if (note !== undefined) order.note = note;
      if (total_price !== undefined) order.total_price = total_price;

      if (status !== undefined && status !== null) {
        const normalizedStatus = normalizeStatusToEnumValue(status);
        if (!normalizedStatus) {
          return res.status(400).json({ message: "Trạng thái không hợp lệ" });
        }
        order.status = normalizedStatus;
      }

      await order.save();
      await order.reload();

      return res.status(200).json({ message: "Cập nhật thành công", order });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const order = await OrderModel.findByPk(id);
      if (!order) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      await order.destroy();

      res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = OrderController;
