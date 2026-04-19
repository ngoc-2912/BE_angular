const connection = require("../database");
const { DataTypes } = require("sequelize");

const Category = connection.define(
  "Category",
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('0', '1'),
      defaultValue: '1',
    },
  },
  {
    tableName: "categories",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Category;
