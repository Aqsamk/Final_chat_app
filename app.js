const path = require('path');
const fs=require('fs');

const express = require('express');
const bodyParser = require('body-parser');

const sequelize=require('./util/database');
const User=require('./models/signup');
const Chat=require('./models/chat');
const Group=require('./models/group');
const user_group=require('./models/user_group');


var cors =require('cors');

const app = express();

app.use(cors({
    origin:"null",
    methods:["GET"],
}));


// app.set('view engine', 'ejs');
// app.set('views', 'views');

const usersrouteRoutes = require('./routes/signup');
const loginRoutes = require('./routes/login');
const chatRoutes = require('./routes/chat');
const GroupRoutes = require('./routes/group');
const GroupchatRoutes=require('./routes/groupchat');


app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



app.use(usersrouteRoutes);
app.use(loginRoutes);
app.use(chatRoutes);
app.use(GroupRoutes);
app.use(GroupchatRoutes);



// app.use((req,res)=>{
// console.log('url',req.url);
// //res.sendFile(path.join(__dirname,`Expensetrackerfrontend/${req.url}`))
// })

User.hasMany(Chat);
Chat.belongsTo(User);

User.belongsToMany(Group, { through: 'user_group', foreignKey: 'signupId' });
Group.belongsToMany(User, { through: 'user_group', foreignKey: 'groupId' });

sequelize
//.sync()
.sync()
.then(result=>{
   app.listen(3000,() => {console.log('server listening on 3000')});
})
.catch(err=>{
    console.log(err);
}); 





