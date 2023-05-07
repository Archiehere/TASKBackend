const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');

const User = sequelize.define('user', {
    _id:{
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name:{
        type: Sequelize.STRING
    },
    user_name: {
        type: Sequelize.STRING,
        unique:true
    },
    email:{
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        defaultValue: null
    }
});

module.exports = User;