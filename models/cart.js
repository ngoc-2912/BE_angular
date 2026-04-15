const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const User = require("./user");

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    tableName: "carts",
    timestamps: true,
    underscored: true,
  },
);

Cart.belongsTo(User, { foreignKey: "user_id" });

module.exports = Cart;