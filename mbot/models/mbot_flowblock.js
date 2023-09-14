module.exports = (sequelize, DataTypes) => {
    const mbot_flowblock = sequelize.define("mbot_flowblock", {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flowName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contentType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING(1000),
      },
      isDelay: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0
      },
      delayPeriod: {
        type: DataTypes.INTEGER,
      },
    })
   
    return mbot_flowblock
   };