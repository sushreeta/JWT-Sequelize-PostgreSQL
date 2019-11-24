const Sequelize = require('sequelize')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

//configured DB sequelize
const sequelize = require('../config/config')

//It is adviced to create another token schema/model and associate the token table with the userSchema

//Define Model/Schema
const UserSchema = sequelize.define('user',{
     id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
     },
     username:{
          type:Sequelize.STRING,
          unique: true
     },
     email:{
          type:Sequelize.STRING,
          unique: true
     },
     password:{
          type:Sequelize.STRING,
     },
     tokens:{
          //type:Sequelize.ARRAY(Sequelize.STRING),
          type: Sequelize.STRING,
     }
})

// Object.keys(models).forEach((modelName)=>{
//      if('associate' in models[modelName]){
//           models[modelName].associate(models)
//      }
// })

//findByCredentials() used for login to verify the credentials
UserSchema.findByCredentials = function(email, password){
console.log('findByCredentials', this)

//Used Promise() to control the asynchonous function
return new Promise((resolve,reject)=>{
UserSchema.findOne({where:{ email: email }})
     .then((user)=>{
          if(!user){
               console.log('find all reject', user)
               return reject('invalid email/password')
          }
          return bcryptjs.compare(password, user.password)
               .then((result)=>{
                    if(result){
                         console.log('find all resolve', user.dataValues)
                         return resolve(user.dataValues)
                    } else {
                         console.log('find all invalid password', result)
                         return reject('invalid email/password')
                    }
               })
     })
     .catch((err)=>{
          return Promise.reject(err)
     })
})
}

//This is used to verify the user/token for activities after login
UserSchema.findByToken = function(token){
     const user = this
     let tokenData
     try{
          tokenData=jwt.verify(token,'jwt@123')

     } catch(err){
          return Promise.reject(err)
     }
     return user.findOne({
          id:tokenData.id,
          'tokens.token':token
     })
}

//Genrate JWT token used for login
UserSchema.generateToken = async function(user){
     //console.log('generate token', user)
     const tokenData = {
          id: user.id,
          username: user.username,
          CreatedAt: Date.now()
     }
     const token = await jwt.sign(tokenData,'jwt@123')
     //console.log('token',token)

     //executing after the login post function so using promise() tried aync and awit but didn't work   
     return await new Promise((resolve,reject)=>{
          UserSchema.update(
          {tokens: token},
          {where: {id: user.id}})
               .then((user)=>{
                    //console.log('token inserted', token)
                    return resolve(token)
               })
               .catch((err)=>{
                    return reject(err)
               }) 
     })
}

//Delete the token and logout
UserSchema.removeToken = async function(user, token){
     return await new Promise((resolve,reject)=>{
          UserSchema.update(
          {tokens: ""},
          {where: {id: user.id}})
               .then((id)=>{
                    console.log('token deleted', id)
                    return resolve()
               })
               .catch((err)=>{
                    return reject(err)
               }) 
     })
}

//Pre Hook to encrypt the password
// https://stackoverflow.com/questions/31427566/sequelize-create-model-with-beforecreate-hook
// new version doestion support callback function so to complete the data flow back to create() return a promise
UserSchema.beforeCreate((user, options, callback)=>{
     return new Promise((resolve,reject)=>{
          bcryptjs.genSalt(10, function(err, salt){
               bcryptjs.hash(user.password, salt, function(err, encryptedPassword){
                    console.log('prehook password encryption', encryptedPassword)
                    user.password = encryptedPassword
                    return resolve(user, options)
               })
          })   
     })
})

//User.sync({force: true}) this will drop the existing table at the time of server starts
UserSchema.sync()
     .then(response=>{
     console.log('user synced')
     })
     .catch(error=>{
     console.log('error', error)
     })

module.exports = UserSchema