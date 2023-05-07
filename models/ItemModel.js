const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');

const Item = sequelize.define('item',{
    _id:{
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    text:{
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Item;