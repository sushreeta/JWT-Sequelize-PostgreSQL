const Sequelize = require('sequelize');

//create connection | Sequelize('dbName', 'username', 'password'
const sequelize = new Sequelize('testdb', 'postgres', 'postgres', {
     dialect: 'postgres'
})

//To confirm the connection has been established with the postgresql DB
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err)
  })

module.exports = sequelize