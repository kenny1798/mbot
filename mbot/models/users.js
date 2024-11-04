module.exports = (sequelize, DataTypes) => {
 const user = sequelize.define("users", {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isValidate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    verificationCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subscription: {
        type: DataTypes.STRING,
        defaultValue: "basic"
    },
    contacts: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
    },
    allowedContacts: {
        type: DataTypes.BIGINT,
        defaultValue: 30,
    },
    allowedGenerateCW: {
        type: DataTypes.BIGINT,
        defaultValue: 10,
    },
 })

 return user
};