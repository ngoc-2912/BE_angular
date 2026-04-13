const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Category = require("./category");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Category,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("0", "1"),
      defaultValue: "1",
    },
  },
  {
    tableName: "products",
    timestamps: true,
    underscored: true,
  },
);

Product.belongsTo(Category, { foreignKey: "category_id" });

module.exports = Product;
