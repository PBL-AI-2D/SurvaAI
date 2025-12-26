export default (sequelize, DataTypes) => {
  const DatasetAi = sequelize.define('DatasetAi', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nama_dataset: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    sumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    jumlah_data: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    jumlah_umaks: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    versi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    file_path: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    file_type: {
      type: DataTypes.STRING(50),
      allowNull: true, // 'csv', 'excel', 'json'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    preview_data: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    id_survei: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Survei',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    id_umum: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Umum',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    tanggal_upload: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'dataset_ai',
    timestamps: false,
    underscored: true,
  });

  DatasetAi.associate = (models) => {
    DatasetAi.belongsTo(models.Survei, { foreignKey: 'id_survei' });
    DatasetAi.belongsTo(models.Umum, { foreignKey: 'id_umum' });
    DatasetAi.hasMany(models.PerformaModel, { foreignKey: 'id_dataset' });
    DatasetAi.hasMany(models.AnalisisAi, { foreignKey: 'id_dataset' });
  };

  return DatasetAi;
};

