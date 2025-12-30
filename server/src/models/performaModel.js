export default (sequelize, DataTypes) => {
  const PerformaModel = sequelize.define('PerformaModel', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_dataset: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'DatasetAi',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    nama_model: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    akurasi: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    precision: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    recall: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    f1_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tanggal_uji: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'performa_model',
    timestamps: false,
    underscored: true,
  });

  PerformaModel.associate = (models) => {
    PerformaModel.belongsTo(models.DatasetAi, { foreignKey: 'id_dataset' });
    PerformaModel.hasMany(models.AnalisisAi, { foreignKey: 'id_performa' });
  };

  return PerformaModel;
};

