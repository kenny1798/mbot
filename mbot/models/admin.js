module.exports = (sequelize, DataTypes) => {
    const admin = sequelize.define("admin", {
      queue: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    })
   
    return admin
   };