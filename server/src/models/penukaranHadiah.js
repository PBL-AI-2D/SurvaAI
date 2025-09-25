export default (sequelize, DataTypes) => {
  const PenukaranHadiah = sequelize.define('PenukaranHadiah', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    id_umum: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Umum',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    total_poin: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: 'penukaran_hadiah',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    paranoid: false,
  });

  PenukaranHadiah.associate = (models) => {
    PenukaranHadiah.belongsTo(models.Umum, { foreignKey: 'id_umum' });
  };

  return PenukaranHadiah;
};
