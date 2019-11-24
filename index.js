const Express = require('express')
const app = Express()
const sequelize = require('./database/config/config')
app.use(Express.json())
const { userRouter } = require('./controllers/userController')

const port = 3005

app.use('/', userRouter)


app.listen(port, function(){
     console.log('listening to port', port)
})