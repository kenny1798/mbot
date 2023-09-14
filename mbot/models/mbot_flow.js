module.exports = (sequelize, DataTypes) => {
    const mbot_flow = sequelize.define("mbot_flow", {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flowName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    })
   
    return mbot_flow
   };