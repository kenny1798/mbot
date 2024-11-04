module.exports = (sequelize, DataTypes) => {
    const wsauth = sequelize.define("wsauth", {
       username: {
           type: DataTypes.STRING,
           allowNull: false,
       },
       status: {
           type: DataTypes.STRING,
           allowNull: false,
       },
       clientNumber: {
           type: DataTypes.STRING,
           allowNull: false,
       },
    })
   
    return wsauth
   };