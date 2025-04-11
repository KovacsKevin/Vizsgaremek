const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "mysql",  
  host: "localhost", 
  username: "root",  
  password: "",      
  database: "sportpartner_kereso",
});

module.exports = sequelize;
