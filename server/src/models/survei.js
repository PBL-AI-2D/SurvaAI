export default (sequelize, DataTypes) => {
  const Survei = sequelize.define('Survei', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    id_umum: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Umum',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    judul: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    deskripsi: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.STRING(255),
      defaultValue: 'draft',
      validate: {
        isIn: [['draft', 'under_review', 'payment_pending', 'published', 'closed', 'archived', 'rejected']]
      }
    },
    kriteria: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    jumlah_responden: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    tanggal_mulai: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    tanggal_berakhir: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    hadiah_poin: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    umpan_balik: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'survei',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    paranoid: false
  });

  Survei.associate = (models) => {
    Survei.belongsTo(models.Umum, { foreignKey: 'id_umum'});
    Survei.hasMany(models.PertanyaanSurvei, { foreignKey: 'id_survei'});
    Survei.hasOne(models.PembayaranSurvei, { foreignKey: 'id_survei'});
    Survei.hasMany(models.ResponSurvei, { foreignKey: 'id_survei'});
  };

  return Survei;
}
