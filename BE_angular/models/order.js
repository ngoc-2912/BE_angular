const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const User = require("./user");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    total_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "0",
        "1",
        "2",
        "3",
      ),
      defaultValue: "0",
      allowNull: false,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    underscored: true,
  },
);

Order.belongsTo(User, { foreignKey: "user_id" });

module.exports = Order;
