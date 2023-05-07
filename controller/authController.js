const { ErrorHandler } = require("../middleware/errors");
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const jwt = require("jsonwebtoken");
const mailer = require("../middleware/mailer");
const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const regexval = require("../middleware/validate");
require('dotenv').config();

const home = async (req,res,next) => {
    try {
        return res.send('Welcome to backend');
    } catch (error) {
        return next(new ErrorHandler(500,"ISE"));
       
    }
};

const email = async (req,res,next) => {
    try {
        const {email} = req.body;
        if(!email)
            return next(new ErrorHandler(400,"Email is required"));
        if(!regexval.validatemail(email)){
            return next(new ErrorHandler(406,"Incorrect Email Format."));

        }
        const oldMail = await User.findOne({
            where:{
                email:email.toLowerCase()
            }
        });
        if(oldMail){
            return next(new ErrorHandler(400,"User by this email already exists"));
        }

        const mailedOTP = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });
        mailer.sendmail(email,mailedOTP);
        const expiresat = Date.now() + 300000;
        const oldotp = await Otp.update({
            email:email.toLowerCase(),
            otp : mailedOTP,
            expiry : expiresat
        },
        {
            where:{
                email: email.toLowerCase()
            }
        });
        if(oldotp[0]==0){
            await Otp.create({
                email:email.toLowerCase(),
                otp : mailedOTP,
                expiry : expiresat
            });
        }
        return res.status(200).json({success:true,msg:`OTP for verification sent on ${email}`});
    } catch (err) {
        next(err);
    }
}

const everify = async (req,res,next) => {
    try {
        const {email,otp,password,name} = req.body;
        if (!otp || !password || ! name) {
            return next(new ErrorHandler(400,"Input is required"));
        }

        if(!regexval.validatepass(password)){
            return res.status(400).json({sucess:false,msg:"Incorrect Password Format"});
          }
        
          const encryptedPassword = await bcrypt.hash(password, 12);
        const otpdb = await Otp.findOne({
            where:{
                email:email.toLowerCase()
            }
        });
        if(!otpdb)
            return next(new ErrorHandler(404,"user not found by the given mail"));
        if(otpdb.expiry<=Date.now()||otpdb.otp!=otp){
            return next(new ErrorHandler(400,"Invalid OTP"));
        }
        const prev = await User.findOne({
            where:{
                email:email.toLowerCase()
            }
        })
        let user;
        if(!prev){
            user  = await User.create({
                email:email.toLowerCase(),
                password:encryptedPassword,
                name:name
            });
        }else{
            user = prev;
        }
        if(user){
            await Otp.destroy({
                where:{
                    email:user.email
                }
            });
        }
        const token = jwt.sign({_id:user._id},process.env.jwtsecretkey1,{expiresIn:"1d"});
        if(user)
            return res.status(200).json({success:true,msg:'OTP Verified.',token});
        
    } catch (err) {
        next(err);
    }
}



const login = async (req, res,next) => {
    try {
        const { 
            email,
            password
        } = req.body;
        if (!(email && password)) {
            return next(new ErrorHandler(400,"All Inputs required"));
        }
        let user = await User.findOne({
            where:{
                email:email.toLowerCase()
            },
            attributes:['_id','name','password']
        });
        if (!user)
        return next(new ErrorHandler(400,"This email doesn't have an account"));

        const result = await bcrypt.compare(password, user.password);
        if (!result) return next(new ErrorHandler(400,"Wrong Password"));

        const token = jwt.sign({_id:user._id},process.env.jwtsecretkey1,{expiresIn:"2d"});
        return res.status(200).json({sucess: true,msg:`Welcome back! ${user.name}`,token,user});
    } catch (err) {
        next(err);
    }
}

const forgotpwd = async (req,res,next) => {
    try {
        const {email} = req.body;

        if (!email) {
            return next(new ErrorHandler(400,"All Inputs required"));
        }

        const user = await User.findOne({where:{email:email.toLowerCase()}});

        if (!user)
        return next(new ErrorHandler(400,"This email doesn't have an account"));

        const mailedOTP = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });
        const result = mailer.sendmail(email,mailedOTP);

        if(result){
            const expiresat = Date.now() + 300000;

            const oldotp = await Otp.update({
                otp : mailedOTP.toString(),
                expiry : expiresat
            },
            {
                where:{
                    email
                }
            });

            if(oldotp[0]==0){
                await Otp.create({ 
                    email:email.toLowerCase(),
                    otp : mailedOTP,
                    expiry : expiresat
                });
            }

            return res.status(200).json({sucess: true, msg:'OTP sent'});

        } else{
            return next(new ErrorHandler(500,"OTP not sent"));
        }

    } catch (err) {
        //console.log(err);
        next(err)
    }
}

const fverify = async (req,res,next) => {
    try {
        const {
            email,
            otp
        } = req.body;
        if (!otp) {
            return next(new ErrorHandler(400,"All Inputs required"));
         }
        const user = await User.findOne({
            where:{
                email:email.toLowerCase()
            }
        });

        if(!user) 
        return next(new ErrorHandler(404,'user not found by the given mail'));

        const token=jwt.sign({_id:user._id},process.env.jwtsecretkey1,{expiresIn:"2d"});

        const sentotp = await Otp.findOne({
            where:{
                email:email.toLowerCase()
            }
        });

        if(!sentotp)
        return next(new ErrorHandler(400,'This OTP has expired'));

        if(sentotp.otp == otp && sentotp.expiry > Date.now()){
            await Otp.destroy({
                where:{
                    email:user.email
                }
            });
            return res.status(200).json({success:true,msg:`OTP Verified!`,token});
        }
        else if(sentotp.otp == otp && sentotp.expiry <= Date.now()){
            return next(new ErrorHandler(400,'This OTP has expired'));
        }
        else{
            return next(new ErrorHandler(400,'Incorrect OTP'));
        }

    } catch (err) {
        //console.log(err);
        next(err);
    }
}

const resetpass = async(req,res,next) => {
    try {
        const {password} = req.body;
        if(!password)
        return next(new ErrorHandler(400,"All Inputs required"));
        if(!regexval.validatepass(password))
        return next(new ErrorHandler(400,"Incorrect Password Format"));
        const user = req.user;
        const encryptedPassword = await bcrypt.hash(password, 12);
        const updatepass = User.update({
            password:encryptedPassword
        },{
            where:{
                email:user.email
            }
        });
        if(updatepass[0]!=0)
            return res.status(200).json({sucess:true,msg:"Successfully reset password."});
        else
        return next(new ErrorHandler(404,"User Not Found"));
    } catch (err) {
        //console.log(err);
       next(err);
    }
}

const resendotp = async (req,res,next) => {
    try {
        const {email} = req.body;

        if (!email) {
            return next(new ErrorHandler(400,"All Inputs required"));
        }

        const user = await User.findOne({where:{email}});

        if(!user)
        return next(new ErrorHandler(404,"User Not Found"));

        const mailedOTP = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });
        const result = mailer.sendmail(email,mailedOTP);
        //console.log('mail sent.');
        const expiresat = Date.now() + 300000;
        const oldotp = await Otp.update({
            otp : mailedOTP,
            expiry : expiresat
        },
        {
            where:{
                email
            }
        });
        if(oldotp[0]==0){
            await Otp.create({
                otp : mailedOTP,
                email,
                expiry : expiresat
            })
        }
        return res.status(200).json({success:true,msg:"Otp sent to mail"});
    } catch (err) {
        //console.log(err);
       next(err);
    }
}



module.exports = {
    home,
    email,
    everify,
    login,
    forgotpwd,
    fverify,
    resetpass,
    resendotp
}