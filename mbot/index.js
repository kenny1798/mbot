const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = parseInt(process.env.SERVER_PORT, 10);
const db = require('./models');
const { mbot_auth, mbot_campaign } = require('./models');
const fs = require('fs');
const fsx = require('fs-extra')
const https = require('https')
const http = require('http');
const {Server} = require("socket.io");
const multer = require('multer');
const path = require('path');
const { validateToken, validateAdmin } = require('./middlewares/AuthMiddleware');
const { Client, LocalAuth } = require('whatsapp-web.js');
var qrcode = require('qrcode-terminal');


app.use(express.json());
app.use(cors());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('form_images'))
app.use(express.static('flowmedia'))

const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT"],
    }
});

//ROUTES
const broadcastRouter = require('./routes/broadcast')
app.use("/api/broadcast", broadcastRouter);

const usersRouter = require('./routes/user')
app.use("/api/user", usersRouter);

const validateRouter = require('./routes/validate');
app.use("/api/validate", validateRouter);

app.get('/test', (req,res) => {
    const list = [1,2,3,4,5];
    for (var i =0; i< list.length; i++){
        if(i+1 >= list.length){
            res.json(i)
        }
    }
})



app.get('/mbot/auth', validateToken, (req,res) => {
try{
    const username = req.user.username;
    
    const client = new Client({
            authStrategy: new LocalAuth({clientId: username}),
            puppeteer: {headless: false,
            args: [ '--disable-gpu',
             '--disable-setuid-sandbox',
             '--no-sandbox'],
             executablePath: process.env.EXECUTE_PATH}
                    });

    client.initialize();

    const checkPath =  String(`./.wwebjs_auth/session-${username}`);
    if(checkPath){
        const removePath = () =>{fs.rmSync(checkPath, {recursive: true});} 
        if (removePath){
            client.on('qr', (qr)  => {
                    io.emit('qrvalue', qr);
                    io.emit('message', 'QR Code is generated, scan now to get started.')
                    io.emit('btnhide', 'hide');
                    io.emit('loading', ''); 
                
            })
        }else{
            console.log('cant overwrite session')
        }

    }else{
        client.on('qr', (qr)  => {
                io.emit('qrvalue', qr);
                io.emit('message', 'QR Code is generated, scan now to get started.')
                io.emit('btnhide', 'hide');
                io.emit('loading', '');   
            
        })
    }            
            client.on('ready', () => {
                console.log('ready!')
                io.emit('qrvalue', '');
                io.emit('message', 'QR Scanned. Initializing authorized connection..' );
                io.emit('loading', 'load');
                    const checkAuth = async () => {
                        const dbAuthCheck = await mbot_auth.findOne({where: {username:username}})
                        if(!dbAuthCheck){
                            const createSession = await mbot_auth.create({
                                username:username,
                                status:'Connected'
                            })
                            const sessionPath = String(`./.wwebjs_auth/session-${username}`);
                        if(fs.existsSync(sessionPath) && createSession){
                            io.emit('message', 'Session Stored');
                            io.emit('loading', '');
                        const delay = () =>{
                            client.destroy();
                            io.emit('status','connected')
                        }
                        setTimeout(delay, 2000)
                        } 
                        }else{
                            const createSession = await mbot_auth.update({status:'Connected'}, {where:{username:username}})
                            const sessionPath = String(`./.wwebjs_auth/session-${username}`);
                        if(fs.existsSync(sessionPath) && createSession){
                            io.emit('message', 'Session Stored');
                            io.emit('loading', '');
                        const delay = () =>{
                            client.destroy();
                            io.emit('status','connected')
                        }
                        setTimeout(delay, 2000)
                        }
                        }
                       
                    }
                    setTimeout(checkAuth, 3000)
                });

}catch(error){
    res.status(500).send({error:error})
}
});

app.get('/mbot/auth/reconnect', validateToken, async (req,res) => {
    try{
        const username = req.user.username;
        const path = String(`./.wwebjs_auth/session-${username}`)
        const delAuth = fs.unlinkSync(path);
        if(delAuth){
            await mbot_auth.update({status:'Disconnected'},{where:{username:username}}).then(() => {
                res.status(202).json({})
            })
        }
    }catch(error){
        res.status(401).json({error:"WhatsApp reconnect failed. Please try again later."})
    }
})

app.get('/mbot/auth/check', validateToken, async (req,res) => {
    try{
        const username = req.user.username;
        const checkAuth = await mbot_auth.findOne({where: {username:username}});
        const sessionPath = String(`./.wwebjs_auth/session-${username}`);
        if(checkAuth){
            const authStatus = await checkAuth.status
            if(authStatus == 'Connected' && fs.existsSync(sessionPath)){
                res.json({status:'connected'})
            }else{
                res.json({status:''})
            }
        }else{
            res.json({status: ''})
        }
        }catch(error){
            res.status(401).json({error: 'Unable to connect server'})
        }
})

app.get('/admin-auth', validateAdmin, async (req,res) => {

    const admin = process.env.ADMIN_LOGIN;
                const client = new Client({
                        authStrategy: new LocalAuth({clientId:admin}),
                        puppeteer: {headless: true,
                        args: [ '--disable-gpu',
                        '--disable-setuid-sandbox',
                        '--no-sandbox'],
                        executablePath: process.env.EXECUTE_PATH}
                    });
            
                    
            client.initialize();
        
                client.on('qr', (qr)  => {
                    io.emit('qrvalue', qr);
                    io.emit('message', 'QR Code is generated, scan now to get started.')
                    io.emit('btnhide', 'hide');
                    io.emit('loading', ''); 
                           
                    
                })
                
            client.on('ready', () => {
                    io.emit('qrvalue', '');
                    io.emit('message', 'QR Scanned. Initializing authorized connection..' );
                    io.emit('loading', 'load');
                    const checkAuth = () => {
                        const sessionPath = String(`./.wwebjs_auth/session-${admin}`);
                    if(fs.existsSync(sessionPath)){
                        io.emit('loading', '');
                    const delay = () =>{
                        client.destroy();
                        io.emit('status','ready')
                    }
                    setTimeout(delay, 2000)
                    io.emit('message', 'Session Stored');
                    }
                    }
                    setTimeout(checkAuth, 3000)
                });
            
            
    });


app.get('/admin/session/delete', validateAdmin, async (req,res) => {

const admin = process.env.ADMIN_LOGIN;
const sessionPath = String(`./.wwebjs_auth/session-${admin}`);
const deletesession = fs.rmSync(sessionPath, {recursive: true});
if(deletesession){
        res.json ({errmsg: 'Failed to delete session'})
        console.log("Unable to delete session");
    }else{
        res.json({msg: "Session deleted successfully"})
        console.log("Session deleted");
    }

});
 
// Start server
db.sequelize.sync().then(() => {
    server.listen(port, async () =>{
    await mbot_campaign.update({campaignStatus:"Stopped"}, {where:{campaignStatus:"Running"}})
                console.log("Server running on port " + port);
    })

})





