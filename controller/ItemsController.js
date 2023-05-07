const { ErrorHandler } = require("../middleware/errors");
const item = require('../models/ItemModel');
const User = require('../models/userModel');


const create = async (req,res) => {
    try {
        const {
            text
        } = req.body;
        if(!text){
            return next(new ErrorHandler(400,"All Inputs required"));
        }

        
        const user = req.user;
        if(!user.isSignedup){
            return next(new ErrorHandler(400,"Unauthorized"));
        }
        
        const item = await user.createitem({
            text,
        });
       
            return res.status(201).json({success:true,msg:"Created item",id:item._id});
    } catch (err) {
        //console.log(err);
        next(err);
    }
}

const getitem = async (req,res) => {
    try {
        const {itemId} = req.params;
        if(!itemId)
        return next(new ErrorHandler(400,"All Inputs required"));
        const item = await item.findByPk(itemId);
        
        return res.status(200).json({success:true,item});
    } catch (err) {
        console.log(err);
        next(err);
    }
}







const delitem = async (req,res) => {
    try {
        const {id} = req.params;
        const user = req.user;
        const deleteditem = await item.destroy({
            where:{
                _id:id,
                userId:user._id
            }
        });
        console.log(deleteditem);
        
            return res.status(200).json({success:true,msg:'Deleted item'});
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,msg:`${err}`});
    }
}








module.exports = {
    create,
    delitem,
    getitem
}