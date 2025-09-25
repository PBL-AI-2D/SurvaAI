export default (sequelize, DataTypes) => {
  const PertanyaanSurvei = sequelize.define('PertanyaanSurvei', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_survei: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Survei',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    teks_pertanyaan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tipe_pertanyaan: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: [['pilihan_ganda', 'essay', 'checkbox', 'dropdown', 'skala']],
      }
    },
    opsi: {
      type: DataTypes.JSONB,
    },
    is_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    tipe_visualisasi: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['pie', 'bar', 'doughnut', 'radar', 'text', 'wordcloud', 'sentiment_analysis']]
      }
    },
    index: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'pertanyaan_survei',
    timestamps: false,
    underscored: true,
  });

  PertanyaanSurvei.associate = (models) => {
    PertanyaanSurvei.belongsTo(models.Survei, { foreignKey: 'id_survei' });
  };

  return PertanyaanSurvei;
};
