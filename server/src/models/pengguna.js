import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
  const Pengguna = sequelize.define('Pengguna', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255)
    },
    email_confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_confirmation_token: {
      type: DataTypes.STRING(255),
    },
    reauth_token: {
      type: DataTypes.STRING(255),
    },
    email_confirmation_sent_at: {
      type: DataTypes.DATE,
    },
    last_sign_in_at: {
      type: DataTypes.DATE,
    },
    reauth_sent_at: {
      type: DataTypes.DATE,
    },
    role: {
      type: DataTypes.STRING(50),
      defaultValue: 'umum',
      validate: {
        isIn: [['umum', 'admin']],
      },
    },
  }, {
    tableName: 'pengguna',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    paranoid: false,
    hooks: {
      beforeCreate: async (pengguna) => {
        if (pengguna.password) {
          pengguna.password = await bcrypt.hash(pengguna.password, 10);
        }
      },
      beforeUpdate: async (pengguna) => {
        if (pengguna.changed('password')) {
          pengguna.password = await bcrypt.hash(pengguna.password, 10);
        }
      },
    }
  });

  Pengguna.associate = (models) => {
    Pengguna.hasOne(models.Admin, { foreignKey: 'id_pengguna' });
    Pengguna.hasOne(models.Umum, { foreignKey: 'id_pengguna' });
  };

  return Pengguna;
}