const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Cart = require("./cart");
const Product = require("./product");

const CartItem = sequelize.define(
  "CartItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Cart,
        key: "id",
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Product,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  },
  {
    tableName: "cart_items",
    timestamps: true,
    underscored: true,
  },
);

CartItem.belongsTo(Cart, { foreignKey: "cart_id" });
CartItem.belongsTo(Product, { foreignKey: "product_id" });

Cart.hasMany(CartItem, { foreignKey: "cart_id" });
Product.hasMany(CartItem, { foreignKey: "product_id" });

module.exports = CartItem;