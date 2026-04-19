const OrderDetailModel = require('../models/orderDetail');
const OrderModel = require('../models/order');
const ProductModel = require('../models/product');
const VariantModel = require('../models/variant');

class OrderDetailController {
    static composeVariantName(variant) {
        const productName = variant?.Product?.name ?? null;
        const variantName = variant?.name ?? null;
        return [productName, variantName].filter(Boolean).join(" - ") || variantName || null;
    }

    static formatOrderDetail(orderDetail) {
        const item = orderDetail?.toJSON ? orderDetail.toJSON() : orderDetail;
        const composedVariantName = OrderDetailController.composeVariantName(item.Variant);
        const { Product, Variant, ...rest } = item;

        return {
            ...rest,
            name: item.variant_id
                ? (composedVariantName ?? item.name ?? null)
                : (item.Product?.name ?? item.name ?? null),
        };
    }

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
                    },
                    {
                        model: VariantModel,
                        attributes: ['id', 'product_id', 'name', 'price'],
                        include: [
                            {
                                model: ProductModel,
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ],
                order: [['id', 'DESC']]
            });
            res.status(200).json({
                "status": 200,
                "message": "Lấy danh sách thành công",
                "data": orderDetails.map((item) => OrderDetailController.formatOrderDetail(item)),  
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
                    },
                    {
                        model: VariantModel,
                        attributes: ['id', 'product_id', 'name', 'price'],
                        include: [
                            {
                                model: ProductModel,
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });

            if (!orderDetail) {
                return res.status(404).json({ message: "Id không tồn tại" });
            }

            res.status(200).json({
                "status": 200,
                "data": OrderDetailController.formatOrderDetail(orderDetail)
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
                    },
                    {
                        model: VariantModel,
                        attributes: ['id', 'product_id', 'name', 'price'],
                        include: [
                            {
                                model: ProductModel,
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });

            res.status(200).json({
                "status": 200,
                "message": "Lấy danh sách thành công",
                "data": orderDetails.map((item) => OrderDetailController.formatOrderDetail(item))
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { order_id, product_id, variant_id, quantity, price } = req.body;

            if (!order_id || quantity === undefined || quantity === null || price === undefined || price === null) {
                return res.status(400).json({ 
                    "status": 400,
                    "message": "Tất cả trường dữ liệu không được trống" 
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

            let resolvedProductId = null;
            let resolvedVariantId = null;
            let itemName = "";

            if (hasProductId) {
                const product = await ProductModel.findByPk(product_id);
                if (!product) {
                    return res.status(404).json({ message: "Id sản phẩm không tồn tại" });
                }

                resolvedProductId = product.id;
                itemName = product.name;
            } else {
                const variant = await VariantModel.findByPk(variant_id, {
                    include: [
                        {
                            model: ProductModel,
                            attributes: ['id', 'name']
                        }
                    ]
                });
                if (!variant) {
                    return res.status(404).json({ message: "Id variant không tồn tại" });
                }

                resolvedVariantId = variant.id;
                itemName = OrderDetailController.composeVariantName(variant);
            }

            const orderDetail = await OrderDetailModel.create({ 
                order_id, 
                product_id: resolvedProductId,
                variant_id: resolvedVariantId,
                quantity, 
                price,
                name: itemName,
            });

            const formattedOrderDetail = await OrderDetailModel.findByPk(orderDetail.id, {
                include: [
                    {
                        model: ProductModel,
                        attributes: ['id', 'name', 'price']
                    },
                    {
                        model: VariantModel,
                        attributes: ['id', 'product_id', 'name', 'price'],
                        include: [
                            {
                                model: ProductModel,
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });

            res.status(201).json({
                message: "Thêm mới thành công",
                orderDetail: OrderDetailController.formatOrderDetail(formattedOrderDetail)
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { order_id, product_id, variant_id, quantity, price } = req.body;

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

            const hasProductId = product_id !== undefined && product_id !== null;
            const hasVariantId = variant_id !== undefined && variant_id !== null;

            if (hasProductId && hasVariantId) {
                return res.status(400).json({
                    status: 400,
                    message: "Chỉ được truyền product_id hoặc variant_id",
                });
            }

            if (hasProductId) {
                const product = await ProductModel.findByPk(product_id);
                if (!product) {
                    return res.status(404).json({ message: "Id sản phẩm không tồn tại" });
                }
                orderDetail.product_id = product.id;
                orderDetail.variant_id = null;
                orderDetail.name = product.name;
            }

            if (hasVariantId) {
                const variant = await VariantModel.findByPk(variant_id, {
                    include: [
                        {
                            model: ProductModel,
                            attributes: ['id', 'name']
                        }
                    ]
                });
                if (!variant) {
                    return res.status(404).json({ message: "Id variant không tồn tại" });
                }
                orderDetail.variant_id = variant.id;
                orderDetail.product_id = null;
                orderDetail.name = OrderDetailController.composeVariantName(variant);
            }

            if (quantity) orderDetail.quantity = quantity;
            if (price) orderDetail.price = price;

            await orderDetail.save();

            const formattedOrderDetail = await OrderDetailModel.findByPk(orderDetail.id, {
                include: [
                    {
                        model: ProductModel,
                        attributes: ['id', 'name', 'price']
                    },
                    {
                        model: VariantModel,
                        attributes: ['id', 'product_id', 'name', 'price'],
                        include: [
                            {
                                model: ProductModel,
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });

            res.status(200).json({
                message: "Cập nhật thành công",
                orderDetail: OrderDetailController.formatOrderDetail(formattedOrderDetail)
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
