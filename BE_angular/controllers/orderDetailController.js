const OrderDetailModel = require('../models/orderDetail');
const OrderModel = require('../models/order');
const ProductModel = require('../models/product');

class OrderDetailController {

    static async get(req, res) {
        try {
            const orderDetails = await OrderDetailModel.findAll({
                include: [
                    {
                        model: OrderModel,
                        attributes: ['id', 'total_price', 'status']
                    },
                    {
                        model: ProductModel,
                        attributes: ['id', 'name', 'price']
                    }
                ]
            });
            res.status(200).json({
                "status": 200,
                "message": "Lấy danh sách thành công",
                "data": orderDetails,  
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;

            const orderDetail = await OrderDetailModel.findByPk(id, {
                include: [
                    {
                        model: OrderModel,
                        attributes: ['id', 'total_price', 'status']
                    },
                    {
                        model: ProductModel,
                        attributes: ['id', 'name', 'price']
                    }
                ]
            });

            if (!orderDetail) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            res.status(200).json({
                "status": 200,
                "data": orderDetail
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getByOrderId(req, res) {
        try {
            const { orderId } = req.params;

            const order = await OrderModel.findByPk(orderId);
            if (!order) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            const orderDetails = await OrderDetailModel.findAll({
                where: { order_id: orderId },
                include: [
                    {
                        model: ProductModel,
                        attributes: ['id', 'name', 'price']
                    }
                ]
            });

            res.status(200).json({
                "status": 200,
                "message": "Lấy danh sách thành công",
                "data": orderDetails
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { order_id, product_id, quantity, price } = req.body;

            if (!order_id || !product_id || !quantity || !price) {
                return res.status(400).json({ 
                    "status": 400,
                    "message": "Tất cả trường dữ liệu không được trống" 
                });
            }

            if (quantity <= 0) {
                return res.status(400).json({ 
                    "status": 400,
                    "message": "Số lượng phải lớn hơn 0" 
                });
            }

            if (price < 0) {
                return res.status(400).json({ 
                    "status": 400,
                    "message": "Giá tiền phải lớn hơn 0" 
                });
            }

            const order = await OrderModel.findByPk(order_id);
            if (!order) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            const product = await ProductModel.findByPk(product_id);
            if (!product) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            const orderDetail = await OrderDetailModel.create({ 
                order_id, 
                product_id, 
                quantity, 
                price 
            });

            res.status(201).json({
                message: "Thêm mới thành công",
                orderDetail
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { order_id, product_id, quantity, price } = req.body;

            const orderDetail = await OrderDetailModel.findByPk(id);
            if (!orderDetail) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            if (quantity && quantity <= 0) {
                return res.status(400).json({ 
                    "status": 400,
                    "message": "Số lượng phải lớn hơn 0" 
                });
            }

            if (price && price < 0) {
                return res.status(400).json({ 
                    "status": 400,
                    "message": "Giá tiền phải lớn hơn 0" 
                });
            }

            if (order_id) {
                const order = await OrderModel.findByPk(order_id);
                if (!order) {
                    return res.status(404).json({ message: "Id không tồn tại" });
                }
                orderDetail.order_id = order_id;
            }

            if (product_id) {
                const product = await ProductModel.findByPk(product_id);
                if (!product) {
                    return res.status(404).json({ message: "Id không tồn tại" });
                }
                orderDetail.product_id = product_id;
            }

            if (quantity) orderDetail.quantity = quantity;
            if (price) orderDetail.price = price;

            await orderDetail.save();

            res.status(200).json({
                message: "Cập nhật thành công",
                orderDetail
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;

            const orderDetail = await OrderDetailModel.findByPk(id);
            if (!orderDetail) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            await orderDetail.destroy();

            res.status(200).json({ message: "Xóa thành công" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = OrderDetailController;
