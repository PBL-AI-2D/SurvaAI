export default (sequelize, DataTypes) => {
  const KonfigurasiSurvei = sequelize.define('KonfigurasiSurvei', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1,
      validate: {
        isOne(value) {
          if (value !== 1) {
            throw new Error('Only row with ID=1 is allowed');
          }
        }
      }
    },
    harga_dasar: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    harga_per_pertanyaan: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    harga_per_responden: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    harga_per_durasi: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'konfigurasi_harga',
    underscored: true,
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: false,
    hooks: {
      beforeCreate: async () => {
        const count = await KonfigurasiSurvei.count();
        if (count >= 1) {
          throw new Error('Only one data configuration is allowed');
        }
      }
    }
  });

  return KonfigurasiSurvei;
};
