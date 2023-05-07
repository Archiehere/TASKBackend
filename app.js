const express = require('express');
const {errorMiddleware} = require('./middleware/errors');
const {sequelize} = require('./utils/database');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');

const User = require('./models/userModel');
const item = require('./models/ItemModel');

require('dotenv').config();
const app = express();
const cors=require('cors');

app.use(cors({origin:true}));
app.use(express.json());


// Associations
item.belongsTo(User,{constraints:true,onDelete:'CASCADE'});
User.hasMany(item);


item.hasMany(item,{sourceKey:'_id',foreignkey:'itemId'});



const connectdb = async ()=>{
    try {
        const result = await sequelize.sync();
        console.log('DB Connection has been established successfully.');
        const server = app.listen(process.env.PORT);
        console.log(`Listening on port ${process.env.PORT}`);
      } catch (err) {
        console.error('Unable to connect to the database:', err);
      }
}
connectdb();

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));


app.use(errorMiddleware);

app.use('/t',itemRoutes,errorMiddleware);

app.use(authRoutes,errorMiddleware);