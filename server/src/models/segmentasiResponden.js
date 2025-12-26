export default (sequelize, DataTypes) => {
  const SegmentasiResponden = sequelize.define('SegmentasiResponden', {
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
    model_versi: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    cluster_label: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    karakteristik: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avg_sentiment: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    avg_satisfaction: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    segment_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    top_features: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    importance: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    segment_rationale: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recommendation_rationale: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    confidence_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    confidence_label: {
      type: DataTypes.STRING(20),
      allowNull: true, // 'high', 'medium', 'low'
    },
    low_confidence_warning: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    respondent_ids: {
      type: DataTypes.JSONB,
      defaultValue: [],
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
    tableName: 'segmentasi_responden',
    timestamps: false,
    underscored: true,
  });

  SegmentasiResponden.associate = (models) => {
    SegmentasiResponden.belongsTo(models.AnalisisAi, { foreignKey: 'id_analisis' });
    SegmentasiResponden.belongsTo(models.Survei, { foreignKey: 'id_survei' });
  };

  return SegmentasiResponden;
};

