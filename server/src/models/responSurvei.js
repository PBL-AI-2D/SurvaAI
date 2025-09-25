export default (sequelize, DataTypes) => {
  const ResponSurvei = sequelize.define('ResponSurvei', {
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
    id_umum: {
      type: DataTypes.UUID,
      references: {
        model: 'Umum',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    profil_metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    respon: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      validate: {
        notEmpty: true
      }
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'respon_survei',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    paranoid: false,
  });

  ResponSurvei.associate = (models) => {
    ResponSurvei.belongsTo(models.Survei, { foreignKey: 'id_survei' });
    ResponSurvei.belongsTo(models.Umum, { foreignKey: 'id_umum' });
  };

  return ResponSurvei;
};
