const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Product = require("./product");

const Variant = sequelize.define(
  "Variant",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "variants",
    timestamps: true,
    underscored: true,
  },
);

Variant.belongsTo(Product, { foreignKey: "product_id" });
Product.hasMany(Variant, { foreignKey: "product_id", as: "variants" });

module.exports = Variant;
