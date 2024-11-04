const express = require('express');
const router = express.Router();
const { users, admin } = require('../models')
const { phoneNumberFormatter } = require('../middlewares/WhatsAppFormatter');
const { validateToken} = require('../middlewares/AuthMiddleware');
const { sign } = require('jsonwebtoken');
const fs = require('fs')
const { Client, LocalAuth } = require('whatsapp-web.js');
var qrcode = require('qrcode-terminal');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
require('dotenv').config()

router.get("/requestverification", validateToken, async (req, res) =>{

    const username = req.user.username;
    const user = await users.findOne ({where: {username: username}});
    const queue = await admin.findOne({where: {id:1}});
    const currentQueue = await queue.queue;
    const addQueue = await queue.queue +1;
    const usernumber = user.phoneNumber;
    const admin_user = process.env.ADMIN_LOGIN;
    const number = phoneNumberFormatter(usernumber);
    const message = "Your Verification Code is " + user.verificationCode;

        const client = new Client({
            authStrategy: new LocalAuth({clientId:admin_user}),
            puppeteer: {headless: true,
            args: [ '--disable-gpu',
            '--disable-setuid-sandbox',
            '--no-sandbox']}
})

    console.log(client)

    if(currentQueue == 0){

        admin.update({queue: addQueue}, {where: {id: 1}})

        client.initialize()
        client.on('ready', () => {
            client.sendMessage(number, message).then(() => {
                if(addQueue == 1){
                    admin.update({queue: currentQueue}, {where: {id: 1}})
                            const delayDestroy = () => {
                                client.destroy();

                                }
                            setTimeout(delayDestroy, 3000);
                }else if(addQueue > 1){
                    const minusQueue = currentQueue - 1;
                    admin.update({queue: minusQueue}, {where: {id: 1}});
                    const delayDestroy = () => {
                        client.destroy();
                        }
                    setTimeout(delayDestroy, 3000);
                }      
            })
        })

    }else if (currentQueue > 0){
        admin.update({queue: addQueue}, {where: {id: 1}});
        const delayMessage = () => {
            client.initialize();

            client.on('ready', () => {
                client.sendMessage(number, message).then(() => {
                    if(addQueue == 1){
                        admin.update({queue: queue}, {where: {id: 1}})
                        const delayDestroy = () => {
                            client.destroy();
    
                            }
                        setTimeout(delayDestroy, 3000);
                    }else if(addQueue > 1){
                        const minusQueue = currentQueue - 1;
                        admin.update({queue: minusQueue}, {where: {id: 1}});
                        const delayDestroy = () => {
                            client.destroy();
                            }
                        setTimeout(delayDestroy, 3000);
                    }
                })
            })
        }
        const timer = 25000 * currentQueue;
        setTimeout(delayMessage, timer)  
    }


})

router.put("/validateuser", validateToken, async (req,res) =>{
    const username = req.user.username;
    const {verificationCode} = req.body;
    if(!verificationCode){
       res.json({error: "Verification Code cannot be blank"})
    }else{

    
    const validate = 1;
    const user = await users.findOne ({where: {username: username}});
    const userVerificationCode = user.verificationCode;
    if(verificationCode == userVerificationCode){
        await users.update({isValidate: validate}, {where: {username: username}});
        const validToken = sign({id: user.id, isValidate: user.isValidate}, process.env.JWT_ACCESS)
        const loginUser = user.username;
        res.json({success: "User verified successfully", valToken: validToken})
    }else if(verificationCode != userVerificationCode){
        res.json({error: "Invalid Verification Code"})
    }else{
        res.json({error: "Unable to verify user to the server"});
    }
}
})

module.exports = router;