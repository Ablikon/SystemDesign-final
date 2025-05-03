module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parentCategoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'parent_category_id',
      references: {
        model: 'categories',
        key: 'id'
      }
    }
  }, {
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'category_name_idx',
        fields: ['name']
      }
    ]
  });

  return Category;
}; 