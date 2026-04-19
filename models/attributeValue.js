const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const AttributeValue = sequelize.define(
  "AttributeValue",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    attribute_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "attribute_values",
    timestamps: false,
    underscored: true,
  },
);

module.exports = AttributeValue;
