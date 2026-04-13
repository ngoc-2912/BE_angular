const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Order = require('./order');
const Product = require('./product');

const OrderDetail = sequelize.define('OrderDetail', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Order,
            key: 'id'
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Product,
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    }
}, {
    tableName: 'order_details',
    timestamps: false
});

OrderDetail.belongsTo(Order, { foreignKey: 'order_id' });
OrderDetail.belongsTo(Product, { foreignKey: 'product_id' });

Order.hasMany(OrderDetail, { foreignKey: 'order_id' });

module.exports = OrderDetail;
