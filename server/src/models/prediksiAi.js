export default (sequelize, DataTypes) => {
  const PrediksiAi = sequelize.define('PrediksiAi', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_analisis: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'AnalisisAi',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    eti_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    trend_label: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    expected_change: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'prediksi_ai',
    timestamps: false,
    underscored: true,
  });

  PrediksiAi.associate = (models) => {
    PrediksiAi.belongsTo(models.AnalisisAi, { foreignKey: 'id_analisis' });
  };

  return PrediksiAi;
};

