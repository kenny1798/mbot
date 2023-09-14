const express = require('express');
const app = express();
const router = express.Router();
const { sign } = require('jsonwebtoken');
const fs = require('fs');
const { mgenSessions, users, admin } = require('../models');
const { validateAdmin } = require('../middlewares/AuthMiddleware');
require('dotenv').config();

router.post("/login", async (req, res) => {

    const {username, password} = req.body;
    const login = process.env.ADMIN_LOGIN
    const pass = process.env.ADMIN_PASS
    if(!username){
        res.json({error: "Please enter a username"});
    }
    else if (!password){
        res.json({error: "Password cannot be blank"});
    }
    else if (username != login){
        res.json({ error : "Admin doesnt exist" });
    }else if (password != pass){
        res.json({ error : "Wrong password" });
    }else{
        const adminToken = sign({ login:login, pass:pass}, process.env.JWT_SECRET);
        res.json({adminToken: adminToken})
    }
});

router.get("/wsauth/check", validateAdmin, async (req,res) => {
    const admin = process.env.ADMIN_LOGIN;
    const sessionPath = String(`./.wwebjs_auth/session-${admin}`);
    if(fs.existsSync(sessionPath)){
        res.json({status:true});
    }else{
        res.json({status:false});
    }
})

router.get("/auth", validateAdmin, (req, res) => {
    res.json(req.admin)
});

router.get('/getuser', validateAdmin, async (req,res) => {
    const user = await users.findAll();
    res.json(user);
});

router.get('/getuser/:user', validateAdmin, async (req,res) => {
    const getuser = req.params.user;
    const user = await users.findOne({where: {username:getuser}});
    const username = await user.username;
    const phoneNumber = await user.phoneNumber;
    const email = await user.email;
    const subscription = await user.subscription;
    try{
        res.json({username: username, phoneNumber:phoneNumber, email:email, subscription:subscription});
    }catch(error){
        res.json({error:error})
    }
    
});

router.put('/user/update/', validateAdmin, async (req,res) => {
    const {username, phoneNumber, email, subscription} = req.body;
    try{
        users.update({
            phoneNumber:phoneNumber,
            email: email,
            subscription:subscription
        }, {where: {username:username}}).then(() => {
            res.json({status: "User updated successfully"})
        })
    }catch(error){
        res.json({error:error})
    }
})


module.exports = router;