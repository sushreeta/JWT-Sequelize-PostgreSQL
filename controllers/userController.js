const Express = require('express')
const Router = Express.Router()
const User = require('../database/models/users')
const {authenticateUser} = require('../middleware/authenticateUser')


//localhost:3005/user
//create a new user
Router.post('/user', (req, res) => {
     User.create(req.body)
      .then((response)=>{
           console.log('User created')
           return res.status(200).json(response.dataValues)
      })
      .catch(error=>{
           console.log('error occured', error)
      })})

//localhost:3005/user & email, password (JSON body)
//To view all users
Router.get('/user', (req,res) =>{
     console.log('user view request')
     User.findAll()
          .then(users => {
               console.log("All users:", JSON.stringify(users));
               return res.status(200).json(users)
          })
          .catch(error=>{
               console.log('error occured', error)
          })}
)

//localhost:3005/login
Router.post('/login',async (req,res)=>{
     const body = req.body
     console.log('login', body)
     User.findByCredentials(body.email, body.password)
          .then(async (user)=>{
               console.log('before generate token', user) 
               const promise = await User.generateToken(user)
               console.log(promise)
               return promise
          })
          .then((token)=>{
               console.log('token in usercontroller',token)
               res.setHeader('x-auth',token).send({})
          })
          .catch((err)=>{
               res.send(err)
          })
})

//localhost:3005/account & token
//To view personal details
Router.get('/account', authenticateUser,(req,res)=>{
     const { user } = req
     res.send(user)
})

//localhost:3005/logout & token
Router.delete('/logout',authenticateUser, (req,res)=>{
     //console.log('logout ',req)
     const { user, token } = req
     User.removeToken(user, token)
          .then(()=>{
               res.send('Successfully logged out')
          })
          .catch((err)=>{
               res.send(err)
          })
})

// Router.delete('/user', (req,res)=>{
//      User.destroy({
//           where: {username: req.params.username}
//      })
//           .then(response=>{
//                console.log('User deleted', response)
//           })
//           .catch(error=>{
//                console.log('error occured', error)
//           })})
module.exports ={
     userRouter : Router
}