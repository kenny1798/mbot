module.exports = (sequelize, DataTypes) => {
    const mbot_autoreply = sequelize.define("mbot_autoreply", {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      keyword: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      condition: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    })
   
    return mbot_autoreply
   };