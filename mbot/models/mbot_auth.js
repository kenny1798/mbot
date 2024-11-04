module.exports = (sequelize, DataTypes) => {
    const mbot_auth = sequelize.define("mbot_auth", {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    })
   
    return mbot_auth
   };