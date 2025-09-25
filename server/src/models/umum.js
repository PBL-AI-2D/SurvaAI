export default (sequelize, DataTypes) => {
  const Umum = sequelize.define('Umum', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_pengguna: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Pengguna',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    nama: {
      type: DataTypes.STRING(255)
    },
    profil_responden: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    profil_klien: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    poin: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
  }, {
    tableName: 'umum',
    timestamps: false,
    underscored: true,
    getterMethods: {
      usia() {
        const profil = this.profil_responden || {};
        const tanggalLahirStr = profil.tanggal_lahir;
        if (!tanggalLahirStr) return null;

        const tanggalLahir = new Date(tanggalLahirStr);
        const sekarang = new Date();
        let usia = sekarang.getFullYear() - tanggalLahir.getFullYear();
        const bulanSelisih = sekarang.getMonth() - tanggalLahir.getMonth();
        const hariSelisih = sekarang.getDate() - tanggalLahir.getDate();
        if (bulanSelisih < 0 || (bulanSelisih === 0 && hariSelisih < 0)) {
          usia--;
        }

        return usia;
      }
    }
  });

  Umum.associate = (models) => {
    Umum.belongsTo(models.Pengguna, { foreignKey: 'id_pengguna' });
    Umum.hasMany(models.Survei, { foreignKey: 'id_umum' });
    Umum.hasMany(models.PembayaranSurvei, { foreignKey: 'id_umum' });
    Umum.hasMany(models.ResponSurvei, { foreignKey: 'id_umum' });
    Umum.hasMany(models.PenukaranHadiah, { foreignKey: 'id_umum' });
  };

  return Umum;
}
