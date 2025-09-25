export default (sequelize, DataTypes) => {
  const PembayaranSurvei = sequelize.define('PembayaranSurvei', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    id_survei: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Survei',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    id_umum: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Umum',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    jumlah_tagihan: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    metode_pembayaran: {
      type: DataTypes.STRING(255),
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'paid', 'failed', 'expired']]
      }
    },
    invoice_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    jumlah_dibayar: {
      type: DataTypes.DECIMAL(20, 2),
      defaultValue: 0
    }
  }, {
    tableName: 'pembayaran_survei',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    paranoid: false
  });

  PembayaranSurvei.associate = (models) => {
    PembayaranSurvei.belongsTo(models.Survei, { foreignKey: 'id_survei'});
    PembayaranSurvei.belongsTo(models.Umum, { foreignKey: 'id_umum'});
  };

  return PembayaranSurvei;
};
