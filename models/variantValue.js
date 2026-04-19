const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const VariantValue = sequelize.define(
  "VariantValue",
  {
    variant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    attribute_value_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    tableName: "variant_values",
    timestamps: false,
    underscored: true,
  },
);

module.exports = VariantValue;
