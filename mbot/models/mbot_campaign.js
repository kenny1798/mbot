module.exports = (sequelize, DataTypes) => {
    const mbot_campaign = sequelize.define("mbot_campaign", {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      campaignName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      msgInterval: {
        type: DataTypes.STRING,
        allowNull:false,
      },
      totalContacts: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      msgSent: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      campaignStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      waSession: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dbFileName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_Schedule: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      scheduleDate: {
        type: DataTypes.DATE,
      },
    })
   
    return mbot_campaign
   };