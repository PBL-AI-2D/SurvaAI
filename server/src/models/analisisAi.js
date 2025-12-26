export default (sequelize, DataTypes) => {
  const AnalisisAi = sequelize.define('AnalisisAi', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_respon: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'ResponSurvei',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
    id_performa: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'PerformaModel',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
    model_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    jenis_analisis: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    confidence_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sentiment_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    satisfaction_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    preference_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    predicted_label: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    processing_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'idle', // 'idle', 'processing', 'done', 'error'
    },
    processing_started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    processing_completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    processing_duration: {
      type: DataTypes.INTEGER, // in milliseconds
      allowNull: true,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tanggal_analisis: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'analisis_ai',
    timestamps: false,
    underscored: true,
  });

  AnalisisAi.associate = (models) => {
    AnalisisAi.belongsTo(models.ResponSurvei, { foreignKey: 'id_respon' });
    AnalisisAi.belongsTo(models.DatasetAi, { foreignKey: 'id_dataset' });
    AnalisisAi.belongsTo(models.PerformaModel, { foreignKey: 'id_performa' });
    AnalisisAi.belongsTo(models.Survei, { foreignKey: 'id_survei' });
    AnalisisAi.hasMany(models.PrediksiAi, { foreignKey: 'id_analisis' });
    AnalisisAi.hasMany(models.SegmentasiResponden, { foreignKey: 'id_analisis' });
  };

  return AnalisisAi;
};

