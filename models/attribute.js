const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Attribute = sequelize.define(
  "Attribute",
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
  },
  {
    tableName: "attributes",
    timestamps: false,
    underscored: true,
  },
);

module.exports = Attribute;
