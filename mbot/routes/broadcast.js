const express = require('express');
const router = express.Router();
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const {phoneNumberFormatter} = require('../middlewares/WhatsAppFormatter');
const path = require('path');
const fs = require('fs');
const fsx = require('fs-extra');
const xlsx = require("xlsx");
const {mbot_flow, mbot_flowblock, mbot_campaign, wsauth} = require('../models')
const multer = require('multer');
const { validateToken } = require('../middlewares/AuthMiddleware');
const { where } = require('sequelize');
require('dotenv').config();

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, './dbexcel')
    },
    filename: (req, file, cb) =>{
        cb(null,"mbot_" + Date.now() + path.extname(file.originalname))
    }

});

const limitFileSize = 7 * 1024 * 1024

var upload = multer({storage: storage});

const storage1 = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, './flowmedia')
    },
    filename: (req, file, cb) =>{
        cb(null,"mbot_" + Date.now() + path.extname(file.originalname))
    }

});

var upload1 = multer({storage: storage1,
    limits: {fileSize:limitFileSize}, 
    fileFilter:(req, file, cb) => {
        if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' || file.mimetype == 'image/png' || file.mimetype == 'video/mp4'){
            cb(null,true)
        }else{
            cb(null, false)
            return cb(new Error('Only .jpg, .jpeg, .png and .mp4 files are allowed'))
        }
    }});

router.get('/get/flow/:id', validateToken, async (req,res) => {
    try{
        const username = req.user.username;
        const id = req.params.id;
        const flow = await mbot_flow.findOne({where:{id:id}})
        const flowName = await flow.flowName;
        const blocks = await mbot_flowblock.findAll({where:{flowName:flowName, username:username}})
        res.json(blocks);
        

    }catch(err){

    }
})

router.get('/get/flowname/:id', validateToken, async (req,res) => {
    try{
        const id = req.params.id;
        const flow = await mbot_flow.findOne({where:{id:id}})
        const flowName = await flow.flowName;
        res.json(flowName);
        

    }catch(err){

    }
})

router.get('/get/flowname/', validateToken, async (req,res) => {
    try{
        const username = req.user.username;
        const flow = await mbot_flow.findAll({where:{username:username}})
        res.json(flow);
    }catch(err){

    }
})

router.get('/get/campaign/', validateToken, async (req,res) => {
    try{
        const username = req.user.username;
        const campaign = await mbot_campaign.findAll({where:{username:username}})
        res.json(campaign);
    }catch(err){

    }
})

router.post('/create/flow/block', validateToken, upload1.single('content'), async (req,res) => {
try{
    const username = req.user.username;
    const flowName = req.body.flowName;
    const contentType = req.body.contentType;
    const isDelay = req.body.isDelay;
    const parsedIsDelay = parseInt(isDelay, 10);
    const delayPeriod = req.body.delayPeriod;
    const parsedDelayPeriod = parseInt(delayPeriod, 10);
    if(contentType === 'Text'){
        const content = req.body.content;
        await mbot_flowblock.create({
            username:username,
            flowName: flowName,
            contentType: contentType,
            content: content,
            isDelay: parsedIsDelay,
            delayPeriod: parsedDelayPeriod
        }).then(() => {
                res.status(201).json({
                    message: 'Block created successfully',
                    flow: flowName
                })
            console.log(parsedDelayPeriod);
            console.log(content);
            const test = __dirname
            console.log(test)
            })
    }else if(contentType === 'Image' | contentType === 'Video'){
        const content = req.file.filename;
        console.log(content)
        await mbot_flowblock.create({
            username:username,
            flowName: flowName,
            contentType: contentType,
            content: content,
            isDelay: parsedIsDelay,
            delayPeriod: parsedDelayPeriod
        }).then(() => {
                res.status(201).json({
                    message: 'Block created successfully',
                    flow: flowName
                })
            })
    }else{
        res.status(404).json({error: 'Unknown file type'})
    }
    // }
    
    }catch(error){
        res.status(404).json({error: error})
    }
})

router.use(function (err,req,res,next) {
    if (err instanceof multer.MulterError){
        res.statusCode = 400;
        res.send({code : err.code});
    }else if (err){
        if(err.message === "FILE_MISSING"){
            res.statusCode = 400;
            res.send({code : "FILE_MISSING"});
        }else{
            res.statusCode = 500;
            res.send({code : "GENERIC_ERROR"});
        }
    }
});

router.get('/delete/flow/block/:id', validateToken, async (req,res) => {
    try{
    const username = req.user.username;
    const blockid = req.params.id;
    await mbot_flowblock.destroy({where:{username:username, id:blockid}}).then(() => {
        res.json({message:'Block deleted'})
    })
    }catch(err){
        console.log(err)
        res.json({error: err})
    } 
})

router.post('/create/flow', validateToken, async(req,res) => {
    const username = req.user.username;
    const flowName = req.body.flowName;
    const dupeFlowName = await mbot_flow.findOne({where:{username:username, flowName:flowName}});
    if(dupeFlowName){
        res.status(403).json({error: "Flow Name already existed"})
    }else{
        await mbot_flow.create({
            username:username,
            flowName:flowName
        }).then(async () => {
            const getData = await mbot_flow.findOne({where:{username:username, flowName:flowName}});
            const id = getData.id;
            res.status(201).json({
                message: 'Flow created successfully',
                flow: flowName,
                id: id
            })
        })
    }
})

router.post('/create/campaign/', upload.single('excelFile'), validateToken, async (req,res) => {
    try{
        const username = req.user.username;
        const checkRunning = await mbot_campaign.findOne({where:{waSession:`session-${username}`, campaignStatus: 'Running'}});

        if(checkRunning){
            if(req.file.filename == null || req.file.filename == 'undefined'){
                res.status(400).json("No file");
            }else{
            const fileName = req.file.filename;
            const filePath = './dbexcel/' + req.file.filename;
            const wb = xlsx.readFile(filePath);
            const sheetName_list = wb.SheetNames;
            let count = [];
            for (var sheetIndex = 0; sheetIndex < sheetName_list.length; sheetIndex++){
                var worksheet = wb.Sheets[sheetName_list[sheetIndex]];
                var range = xlsx.utils.decode_range(worksheet['!ref']);
                var num_rows = range.e.r - range.s.r;
            }
            count.push({
                data_count: num_rows
            })
            const username = req.user.username;
            const {campaignName, inputContent, is_Schedule, msgInterval, scheduleDate} = req.body;
            const parsedSchedule = parseInt(is_Schedule, 10);
            const parsedInterval = parseInt(msgInterval, 10);
            const totalContacts = num_rows + 1;
            const dupeCampaign = await mbot_campaign.findOne({where:{username:username, campaignName:campaignName}})
            const allContent = await mbot_flowblock.findAll({where: {flowName:inputContent}});
            const delayTotal = allContent.reduce(function(t, value){
                return t + value.delayPeriod
            }, 0)

            if(dupeCampaign){
                res.status(201).json({error: "Campaign Name existed"})
            }else{
                await mbot_campaign.create({
                    username: username,
                    campaignName: campaignName,
                    content: inputContent,
                    msgInterval: parsedInterval,
                    totalContacts: totalContacts,
                    msgSent: 0,
                    campaignStatus: 'Stopped',
                    waSession: `session-${username}`,
                    dbFileName: fileName,
                    is_Schedule: parsedSchedule,
                    scheduleDate: scheduleDate
                }).then(() => {
                    res.json({success: "Campaign created successfully"});
                })
            
            }
        }
        }else{
            if(req.file.filename == null || req.file.filename == 'undefined'){
                res.status(400).json("No file");
            }else{
            const fileName = req.file.filename;
            const filePath = './dbexcel/' + req.file.filename;
            const wb = xlsx.readFile(filePath);
            const sheetName_list = wb.SheetNames;
            let count = [];
            for (var sheetIndex = 0; sheetIndex < sheetName_list.length; sheetIndex++){
                var worksheet = wb.Sheets[sheetName_list[sheetIndex]];
                var range = xlsx.utils.decode_range(worksheet['!ref']);
                var num_rows = range.e.r - range.s.r;
            }
            count.push({
                data_count: num_rows
            })
            const username = req.user.username;
            const {campaignName, inputContent, is_Schedule, msgInterval, scheduleDate} = req.body;
            const parsedSchedule = parseInt(is_Schedule, 10);
            const parsedInterval = parseInt(msgInterval, 10);
            const totalContacts = num_rows + 1;
            const dupeCampaign = await mbot_campaign.findOne({where:{username:username, campaignName:campaignName}})
            const allContent = await mbot_flowblock.findAll({where: {flowName:inputContent}});
            const delayTotal = allContent.reduce(function(t, value){
                return t + value.delayPeriod
            }, 0)
    
            if(dupeCampaign){
                res.status(201).json({error: "Campaign Name existed"})
            }else{
                await mbot_campaign.create({
                    username: username,
                    campaignName: campaignName,
                    content: inputContent,
                    msgInterval: parsedInterval,
                    totalContacts: totalContacts,
                    msgSent: 0,
                    campaignStatus: 'Running',
                    waSession: `session-${username}`,
                    dbFileName: fileName,
                    is_Schedule: parsedSchedule,
                    scheduleDate: scheduleDate
                }).then(()=> {
                    res.json({success: "Campaign created successfully"});
                    const sheetValues = wb.Sheets[sheetName_list];
                    const excelData = xlsx.utils.sheet_to_json(sheetValues, {header: 1});
                    const phonenumberList = excelData.reduce((r, e) => (r.push(...e), r));
                        if(is_Schedule == 1){
                            const scheduledPeriod = new Date(scheduleDate) - Date.now();
                            console.log(scheduledPeriod)
                            const scheduledCampaign = () => {
                                const client = new Client({
                                    authStrategy: new LocalAuth({clientId: username}),
                                    puppeteer: {headless: true,
                                    args: [ '--disable-gpu',
                                     '--disable-setuid-sandbox',
                                     '--no-sandbox'],
                                     executablePath: process.env.EXECUTE_PATH}
                                            });
    
                                client.initialize().catch(_ => _);

                                client.on('qr', async() => {
                                    await wsauth.destroy({where: {username:username}});
                                    await mbot_campaign.update({campaignStatus:'Stopped'}, {where: {username: username, campaignName:campaignName }}).then(() => {
                                    const killClient = () => {
                                        client.destroy();
                                    }
                                    setTimeout(killClient, 3000)
                                })
                            })
        
                                try{                   
                                client.on('ready', () => {
                                    for (var i = 0; i < phonenumberList.length; i++){
                                        const list = phonenumberList[i];
                                        const formattedList = phoneNumberFormatter(JSON.stringify(list));
                                            for (var j = 0; j < allContent.length; j++){                                       
                                                    const singleContent = allContent[j];
                                                    const singleContentType = singleContent.contentType;
                                                    const singleContentContent = singleContent.content;
                                                    const singleContentisDelay = singleContent.isDelay;
                                                    const singleContentDelayPeriod = singleContent.delayPeriod;
                                            if(singleContentType == 'Text'){
                                                        const sendTextMsg = async () => {
                                                            try{
                                                                const getStatus = await mbot_campaign.findOne({where:{username: username, campaignName:campaignName}});
                                                                const currentStatus = await getStatus.campaignStatus;
                                                                if(currentStatus == 'Running'){
                                                                    await client.sendMessage(formattedList, singleContentContent).then(async () => {                                          
                                                                        console.log('A text message was sent to ' + list)
                                                                    })
                                                                }else if(currentStatus == 'Stopped'){
                                                                    client.destroy();
                                                                }
                                                                else{
                                                                    console.log(`Campaign ${username} has stopped. Command ignored`)
                                                                }
                                                            }catch(error){
                                                                console.log(error)
                                                            }             
                                                        }
                                                        if(singleContentisDelay == true){
                                                            const delay = (parsedInterval * (i+1) * 1000) + (singleContentDelayPeriod * 1000)
                                                            setTimeout(sendTextMsg, delay)
                                                        }else{
                                                            const delay = parsedInterval * (i+1) * 1000
                                                            setTimeout(sendTextMsg, delay)
                                                        }          
                                                    }
                                            else if(singleContentType == 'Image' | singleContentType == 'Video'){
                                                
                                                        const sendTextMsg = async () => {
                                                            try{
                                                                const getStatus = await mbot_campaign.findOne({where:{username: username, campaignName:campaignName}});
                                                                const currentStatus = await getStatus.campaignStatus;
                                                                if(currentStatus == 'Running'){
                                                            const mediapath = './flowmedia/' + singleContentContent;
                                                            console.log(mediapath);
                                                            const media = MessageMedia.fromFilePath(mediapath);
                                                            await client.sendMessage(formattedList, media).then(async () => {                                          
                                                                console.log('A media message was sent to ' + list)
                                                            })
                                                            }
                                                            else if(currentStatus == 'Stopped'){
                                                                client.destroy();
                                                            }
                                                            else{
                                                                console.log(`Campaign ${username} has stopped. Command ignored`)
                                                            }
                                                            }catch(error){
                                                                console.log(error)
                                                            }                                                                
                                                        }
                                                        if(singleContentisDelay == true){
                                                            const delay = (parsedInterval * (i+1) * 1000) + (singleContentDelayPeriod * 1000)
                                                            setTimeout(sendTextMsg, delay)
                                                        }else{
                                                            const delay = parsedInterval * (i+1) * 1000
                                                            setTimeout(sendTextMsg, delay)
                                                        }          
                                                    }
                                                    
                                                }
                                                const sendTextContact = async () => {
                                                    const currentData = await mbot_campaign.findOne({where: {username:username,campaignName:campaignName}})
                                                    const currentMsgSent = currentData.msgSent;
                                                    const currentCampaignStatus = currentData.campaignStatus;
                                                    const addMsgSent = currentMsgSent + 1;
                                                    if(currentCampaignStatus == 'Running'){
                                                        await mbot_campaign.update({msgSent:addMsgSent}, {where: {username:username, campaignName:campaignName}}).then( async () => {
                                                            const totalContact = currentData.totalContacts;
                                                            const sentMsg = currentData.msgSent + 1;
                                                            console.log(sentMsg)
                                                            console.log(totalContact)
                                                                if(sentMsg == totalContact){
                                                                    const finishingCampaign = async () => {
                                                                    client.destroy();
                                                                    fs.rmSync(filePath, {recursive: true});
                                                                    await mbot_campaign.update({campaignStatus:'Finished'}, {where: {username:username, campaignName:campaignName}})
                                                                    }
                                                                    setTimeout(finishingCampaign, 5000)
                                                                }
                                                            })
                                                    }
                                                        }
                                                const sentMsgUpdateDelay = (parsedInterval * (i+1) * 1000) + ((delayTotal + 1) * 1000);
                                                console.log(sentMsgUpdateDelay);
                                                setTimeout(sendTextContact, sentMsgUpdateDelay);
                                                
                                            }        
                                })
                            }catch(err){
                                console.log(`Client ${username} not ready. Server could not execute command`)
                            }
                            }
                        setTimeout(scheduledCampaign, scheduledPeriod)
                        }else{
                                const client = new Client({
                                    authStrategy: new LocalAuth({clientId: username}),
                                    puppeteer: {headless: true,
                                    args: [ '--disable-gpu',
                                     '--disable-setuid-sandbox',
                                     '--no-sandbox'],
                                     executablePath: process.env.EXECUTE_PATH}
                                            });
        
                                client.initialize().catch(_ => _);

                                client.on('qr', async() => {
                                    await wsauth.destroy({where: {username:username}});
                                    await mbot_campaign.update({campaignStatus:'Stopped'}, {where: {username: username, campaignName:campaignName }}).then(() => {
                                    const killClient = () => {
                                        client.destroy();
                                    }
                                    setTimeout(killClient, 3000)
                                })
                            })
    
                                try{
                                client.on('ready', () => {
                                    for (var i = 0; i < phonenumberList.length; i++){
                                        const list = phonenumberList[i];
                                        const formattedList = phoneNumberFormatter(JSON.stringify(list));
                                            for (var j = 0; j < allContent.length; j++){                                       
                                                    const singleContent = allContent[j];
                                                    const singleContentType = singleContent.contentType;
                                                    const singleContentContent = singleContent.content;
                                                    const singleContentisDelay = singleContent.isDelay;
                                                    const singleContentDelayPeriod = singleContent.delayPeriod;
                                            if(singleContentType == 'Text'){
                                                        const sendTextMsg = async () => {
                                                            try{
                                                                const getStatus = await mbot_campaign.findOne({where:{username: username, campaignName:campaignName}});
                                                                const currentStatus = await getStatus.campaignStatus;
                                                                if(currentStatus == 'Running'){
                                                                await client.sendMessage(formattedList, singleContentContent).then(async () => {                                          
                                                                    console.log('A text message was sent to ' + list)
                                                                })
                                                            }
                                                            else if(currentStatus == 'Stopped'){
                                                                client.destroy();
                                                            }
                                                            else{
                                                                console.log(`Campaign ${username} has stopped. Command ignored`)
                                                            }
                                                            }catch(error){
                                                                console.log(error)
                                                            }
                                                            
                                                        }
                                                        if(singleContentisDelay == true){
                                                            const delay = (parsedInterval * (i+1) * 1000) + (singleContentDelayPeriod * 1000)
                                                            setTimeout(sendTextMsg, delay)
                                                        }else{
                                                            const delay = parsedInterval * (i+1) * 1000
                                                            setTimeout(sendTextMsg, delay)
                                                        }          
                                                    }
                                            else if(singleContentType == 'Image' | singleContentType == 'Video'){
                                                        const sendTextMsg = async () => {
                                                            try{
                                                            const getStatus = await mbot_campaign.findOne({where:{username: username, campaignName:campaignName}});
                                                            const currentStatus = await getStatus.campaignStatus;
                                                            if(currentStatus == 'Running'){
                                                            const mediapath = './flowmedia/' + singleContentContent;
                                                            console.log(mediapath);
                                                            const media = MessageMedia.fromFilePath(mediapath);
                                                                await client.sendMessage(formattedList, media).then(async () => {                                          
                                                                    console.log('A media message was sent to ' + list)
                                                                })
                                                            }
                                                            else if(currentStatus == 'Stopped'){
                                                                client.destroy();
                                                            }
                                                            else{
                                                                console.log(`Campaign ${username} has stopped. Command ignored`)
                                                            }
                                                                }catch(error){
                                                                    console.log(error)
                                                                }
                                                            
                                                        }
                                                        if(singleContentisDelay == true){
                                                            const delay = (parsedInterval * (i+1) * 1000) + (singleContentDelayPeriod * 1000)
                                                            setTimeout(sendTextMsg, delay)
                                                        }else{
                                                            const delay = parsedInterval * (i+1) * 1000
                                                            setTimeout(sendTextMsg, delay)
                                                        }          
                                                    }
                                                    
                                                }
                                                const sendTextContact = async () => {
                                                    const currentData = await mbot_campaign.findOne({where: {username:username,campaignName:campaignName}})
                                                    const currentMsgSent = currentData.msgSent;
                                                    const currentCampaignStatus = currentData.campaignStatus;
                                                    const addMsgSent = currentMsgSent + 1;
                                                    if(currentCampaignStatus == 'Running'){
                                                    await mbot_campaign.update({msgSent:addMsgSent}, {where: {username:username, campaignName:campaignName}}).then( async () => {
                                                    const totalContact = currentData.totalContacts;
                                                    const sentMsg = currentData.msgSent + 1;
                                                    console.log(sentMsg)
                                                    console.log(totalContact)
                                                        if(sentMsg == totalContact){
                                                            const finishingCampaign = async () => {
                                                            client.destroy();
                                                            fs.rmSync(filePath, {recursive: true});
                                                            await mbot_campaign.update({campaignStatus:'Finished'}, {where: {username:username, campaignName:campaignName}})
                                                            }
                                                            setTimeout(finishingCampaign, 5000)
                                                        }
                                                    })
                                                }
                                                        }
                                                const sentMsgUpdateDelay = (parsedInterval * (i+1) * 1000) + ((delayTotal + 1) * 1000);
                                                console.log(sentMsgUpdateDelay);
                                                setTimeout(sendTextContact, sentMsgUpdateDelay);
                                            }        
                                })
    
                            }catch(err){
                                console.log(`Client ${username} not ready. Server could not execute command`)
                            }
                        }
                    
                })
            }      
        }
       
        }

        
    }catch(error){
        res.status(400).json({error: error})
    }
})

router.get('/update/campaign/status/:id', validateToken, async (req,res) => {
    req.setTimeout(0);
    const username = req.user.username;
    const checkRunning = await mbot_campaign.findOne({where:{username:username, campaignStatus:'Running'}});
    if(checkRunning){
        res.json({error: "Can't execute more than one campaign at the same time. Try stopping currently running campaign and try again."})
    }else{
    const campaignid = req.params.id;
    const campaign = await mbot_campaign.findOne({where:{id:campaignid, username:username}});
    const campaignName = await campaign.campaignName;
    const campaignStatus = await campaign.campaignStatus;
    const campaignSendText = await campaign.msgSent;
    const totalContact = await campaign.totalContacts;
    const fileName = await campaign.dbFileName;
    const content = await campaign.content;
    const msgInterval = await campaign.msgInterval;
    const parsedInterval = parseInt(msgInterval, 10);

    const allContent = await mbot_flowblock.findAll({where: {flowName:content}});
    const delayTotal = allContent.reduce(function(t, value){
            return t + value.delayPeriod
        }, 0)
    const filePath = './dbexcel/' + fileName;
    const wb = xlsx.readFile(filePath);
    const sheetName_list = wb.SheetNames;
    let count = [];
        for (var sheetIndex = 0; sheetIndex < sheetName_list.length; sheetIndex++){
            var worksheet = wb.Sheets[sheetName_list[sheetIndex]];
            var range = xlsx.utils.decode_range(worksheet['!ref']);
            var num_rows = range.e.r - range.s.r;
        }
        count.push({
            data_count: num_rows
        })

    if(campaignStatus == 'Running'){
        try{
            await mbot_campaign.update({campaignStatus:'Stopped'}, {where: {id: campaignid}}).then(() => {
                res.status(201).json({message:'Campaign Stopped'})
            })
        }catch(err){
            res.json({error: "Oppps, unable to update status. Please try again."})
            console.log('Unable to update status')
        }
    }else if(campaignStatus == 'Stopped'){
        const sheetValues = wb.Sheets[sheetName_list];
                const excelData = xlsx.utils.sheet_to_json(sheetValues, {header: 1});
                const phonenumberList = excelData.reduce((r, e) => (r.push(...e), r));
                const resumeList = phonenumberList.slice(campaignSendText);
        await mbot_campaign.update({campaignStatus:'Running'}, {where:{id:campaignid}}).then( async () => {
            res.status(201).json({message:'Campaign Started'})
            const client = new Client({
                authStrategy: new LocalAuth({clientId: username}),
                puppeteer: {headless: true,
                args: [ '--disable-gpu',
                 '--disable-setuid-sandbox',
                 '--no-sandbox'],
                 executablePath: process.env.EXECUTE_PATH}
                        });

            
            client.initialize().catch(_ => _);

            client.on('qr', async() => {
                await wsauth.destroy({where: {username:username}});
                await mbot_campaign.update({campaignStatus:'Stopped'}, {where: {username: username, campaignName:campaignName }}).then(() => {
                const killClient = () => {
                    client.destroy();
                }
                setTimeout(killClient, 3000)
            })
        })

            try {
                client.on('ready', () => {   
                    for (var i = 0; i < resumeList.length; i++){
                        const list = resumeList[i];
                        const formattedList = phoneNumberFormatter(JSON.stringify(list));
                            for (var j = 0; j < allContent.length; j++){                                       
                                    const singleContent = allContent[j];
                                    const singleContentType = singleContent.contentType;
                                    const singleContentContent = singleContent.content;
                                    const singleContentisDelay = singleContent.isDelay;
                                    const singleContentDelayPeriod = singleContent.delayPeriod;
                            if(singleContentType == 'Text'){
                                        const sendTextMsg = async () => {
                                            try{
                                                const getStatus = await mbot_campaign.findOne({where:{username: username, campaignName:campaignName}});
                                                            const currentStatus = await getStatus.campaignStatus;
                                                            if(currentStatus == 'Running'){
                                                            await client.sendMessage(formattedList, singleContentContent).then(async () => {                                          
                                                                console.log('A text message was sent to ' + list)
                                                            })
                                                        }
                                                        else if(currentStatus == 'Stopped'){
                                                            client.destroy();
                                                        }
                                                        else{
                                                            console.log(`Campaign ${username} has stopped. Command ignored`)
                                                        }
                                            }catch(error){
                                                console.log(error)
                                            }
                                            
                                        }
                                        if(singleContentisDelay == true){
                                            const delay = (parsedInterval * (i+1) * 1000) + (singleContentDelayPeriod * 1000)
                                            setTimeout(sendTextMsg, delay)
                                        }else{
                                            const delay = parsedInterval * (i+1) * 1000
                                            setTimeout(sendTextMsg, delay)
                                        }    
                                    }
                            else if(singleContentType == 'Image' | singleContentType == 'Video'){
                                        const sendTextMsg = async () => {
                                            try{
                                                const getStatus = await mbot_campaign.findOne({where:{username: username, campaignName:campaignName}});
                                                const currentStatus = await getStatus.campaignStatus;
                                                if(currentStatus == 'Running'){
                                                const mediapath = './flowmedia/' + singleContentContent;
                                                console.log(mediapath);
                                                const media = MessageMedia.fromFilePath(mediapath);
                                                   await client.sendMessage(formattedList, media).then(async () => {                                          
                                                        console.log('A media message was sent to ' + list)
                                                    })
                                                }
                                                else if(currentStatus == 'Stopped'){
                                                    client.destroy();
                                                }
                                                else{
                                                    console.log(`Campaign ${username} has stopped. Command ignored`)
                                                }
                                                }catch(error){
                                                    console.log(error)
                                                }
                                            
                                        }
                                        if(singleContentisDelay == true){
                                            const delay = (parsedInterval * (i+1) * 1000) + (singleContentDelayPeriod * 1000)
                                            setTimeout(sendTextMsg, delay)
                                        }else{
                                            const delay = parsedInterval * (i+1) * 1000
                                            setTimeout(sendTextMsg, delay)
                                        }    
                                    }
                                    
                                }
                                const sendTextContact = async () => {
                                    const currentData = await mbot_campaign.findOne({where: {username:username,campaignName:campaignName}})
                                    const currentMsgSent = await currentData.msgSent;
                                    const currentCampaignStatus = await currentData.campaignStatus;
                                    const addMsgSent = currentMsgSent + 1;
                                    if(currentCampaignStatus == 'Running'){
                                        await mbot_campaign.update({msgSent:addMsgSent}, {where: {username:username, campaignName:campaignName}}).then( async () => {
                                            const totalContact = currentData.totalContacts;
                                            const sentMsg = currentData.msgSent + 1;
                                            console.log(sentMsg)
                                            console.log(totalContact)
                                                if(sentMsg == totalContact){
                                                    const finishingCampaign = async () => {
                                                    client.destroy();
                                                    fs.rmSync(filePath, {recursive: true});
                                                    await mbot_campaign.update({campaignStatus:'Finished'}, {where: {username:username, campaignName:campaignName}})
                                                    }
                                                    setTimeout(finishingCampaign, 5000)
                                                }
                                            })
                                    } 
                                        }
                                const sentMsgUpdateDelay = (parsedInterval * (i+1) * 1000) + ((delayTotal + 1) * 1000);
                                console.log(sentMsgUpdateDelay);
                                setTimeout(sendTextContact, sentMsgUpdateDelay);
                            }  
                })

            }catch(error){
                console.log(error);
            }
        })
    }else{
        res.json({error: "Oppps, something wrong. Please try again."})
        console.log('Error: Cant read status');
    }
    }
    
    
})

router.get('/restart/campaign', async (req,res) => {
    const allRunningCampaign = await mbot_campaign.findAll({where:{campaignStatus: 'Running'}});
    for(var i = 0; i<allRunningCampaign.length; i++){
    const campaign = allRunningCampaign[i];
    const username = await campaign.username;
    const campaignName = await campaign.campaignName;
    const campaignStatus = await campaign.campaignStatus;
    const campaignSendText = await campaign.msgSent;
    const totalContact = await campaign.totalContacts;
    const fileName = await campaign.dbFileName;
    const content = await campaign.content;
    const msgInterval = await campaign.msgInterval;
    const parsedInterval = parseInt(msgInterval, 10);
    
    const allContent = await mbot_flowblock.findAll({where: {flowName:content}});
    const delayTotal = allContent.reduce(function(t, value){
            return t + value.delayPeriod
        }, 0)
    const filePath = './dbexcel/' + fileName;
    const wb = xlsx.readFile(filePath);
    const sheetName_list = wb.SheetNames;
    let count = [];
        for (var sheetIndex = 0; sheetIndex < sheetName_list.length; sheetIndex++){
            var worksheet = wb.Sheets[sheetName_list[sheetIndex]];
            var range = xlsx.utils.decode_range(worksheet['!ref']);
            var num_rows = range.e.r - range.s.r;
        }
        count.push({
            data_count: num_rows
        })

    const sheetValues = wb.Sheets[sheetName_list];
    const excelData = xlsx.utils.sheet_to_json(sheetValues, {header: 1});
    const phonenumberList = excelData.reduce((r, e) => (r.push(...e), r));
    const resumeList = phonenumberList.slice(campaignSendText);
    
    const client = new Client({
        authStrategy: new LocalAuth({clientId: username}),
        puppeteer: {headless: true,
        args: [ '--disable-gpu',
         '--disable-setuid-sandbox',
         '--no-sandbox'],
         executablePath: process.env.EXECUTE_PATH}
                });

    
    client.initialize().catch(_ => _);

    client.on('qr', async() => {
        await wsauth.destroy({where: {username:username}});
        await mbot_campaign.update({campaignStatus:'Stopped'}, {where: {username: username, campaignName:campaignName }}).then(() => {
        const killClient = () => {
            client.destroy();
        }
        setTimeout(killClient, 3000)
    })
})

    try {
        client.on('ready', () => {   
            for (var i = 0; i < resumeList.length; i++){
                const list = resumeList[i];
                const formattedList = phoneNumberFormatter(JSON.stringify(list));
                    for (var j = 0; j < allContent.length; j++){                                       
                            const singleContent = allContent[j];
                            const singleContentType = singleContent.contentType;
                            const singleContentContent = singleContent.content;
                            const singleContentisDelay = singleContent.isDelay;
                            const singleContentDelayPeriod = singleContent.delayPeriod;
                    if(singleContentType == 'Text'){
                                const sendTextMsg = async () => {
                                    try{
                                        const getStatus = await mbot_campaign.findOne({where:{username: username, campaignName:campaignName}});
                                                    const currentStatus = await getStatus.campaignStatus;
                                                    if(currentStatus == 'Running'){
                                                    await client.sendMessage(formattedList, singleContentContent).then(async () => {                                          
                                                        console.log('A text message was sent to ' + list)
                                                    })
                                                }
                                                else if(currentStatus == 'Stopped'){
                                                    client.destroy();
                                                }
                                                else{
                                                    console.log(`Campaign ${username} has stopped. Command ignored`)
                                                }
                                    }catch(error){
                                        console.log(error)
                                    }
                                    
                                }
                                if(singleContentisDelay == true){
                                    const delay = (parsedInterval * (i+1) * 1000) + (singleContentDelayPeriod * 1000)
                                    setTimeout(sendTextMsg, delay)
                                }else{
                                    const delay = parsedInterval * (i+1) * 1000
                                    setTimeout(sendTextMsg, delay)
                                }    
                            }
                    else if(singleContentType == 'Image' | singleContentType == 'Video'){
                                const sendTextMsg = async () => {
                                    try{
                                        const getStatus = await mbot_campaign.findOne({where:{username: username, campaignName:campaignName}});
                                        const currentStatus = await getStatus.campaignStatus;
                                        if(currentStatus == 'Running'){
                                        const mediapath = './flowmedia/' + singleContentContent;
                                        console.log(mediapath);
                                        const media = MessageMedia.fromFilePath(mediapath);
                                           await client.sendMessage(formattedList, media).then(async () => {                                          
                                                console.log('A media message was sent to ' + list)
                                            })
                                        }
                                        else if(currentStatus == 'Stopped'){
                                            client.destroy();
                                        }
                                        else{
                                            console.log(`Campaign ${username} has stopped. Command ignored`)
                                        }
                                        }catch(error){
                                            console.log(error)
                                        }
                                    
                                }
                                if(singleContentisDelay == true){
                                    const delay = (parsedInterval * (i+1) * 1000) + (singleContentDelayPeriod * 1000)
                                    setTimeout(sendTextMsg, delay)
                                }else{
                                    const delay = parsedInterval * (i+1) * 1000
                                    setTimeout(sendTextMsg, delay)
                                }    
                            }
                            
                        }
                        const sendTextContact = async () => {
                            const currentData = await mbot_campaign.findOne({where: {username:username,campaignName:campaignName}})
                            const currentMsgSent = await currentData.msgSent;
                            const currentCampaignStatus = await currentData.campaignStatus;
                            const addMsgSent = currentMsgSent + 1;
                            if(currentCampaignStatus == 'Running'){
                                await mbot_campaign.update({msgSent:addMsgSent}, {where: {username:username, campaignName:campaignName}}).then( async () => {
                                    const totalContact = currentData.totalContacts;
                                    const sentMsg = currentData.msgSent + 1;
                                    console.log(sentMsg)
                                    console.log(totalContact)
                                        if(sentMsg == totalContact){
                                            const finishingCampaign = async () => {
                                            client.destroy();
                                            fs.rmSync(filePath, {recursive: true});
                                            await mbot_campaign.update({campaignStatus:'Finished'}, {where: {username:username, campaignName:campaignName}})
                                            }
                                            setTimeout(finishingCampaign, 5000)
                                        }
                                    })
                            } 
                                }
                        const sentMsgUpdateDelay = (parsedInterval * (i+1) * 1000) + ((delayTotal + 1) * 1000);
                        console.log(sentMsgUpdateDelay);
                        setTimeout(sendTextContact, sentMsgUpdateDelay);
                    }  
        })

    }catch(error){
        console.log(error);
    }
    
    }
})


module.exports = router;
