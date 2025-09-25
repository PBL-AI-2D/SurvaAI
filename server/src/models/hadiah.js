export default (sequelize, DataTypes) => {
  const Hadiah = sequelize.define('Hadiah', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nama: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    deskripsi: {
      type: DataTypes.TEXT,
    },
    stok: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: 0
      } 
    },
    harga_poin: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: 0
      }
    },
  },{
    tableName: 'hadiah',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    paranoid: false
  });

  return Hadiah;
}