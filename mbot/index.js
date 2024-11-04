const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = parseInt(process.env.SERVER_PORT, 10);
const db = require('./models');
const { mbot_auth, mbot_campaign, users, wsauth } = require('./models');
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
app.use(express.static('flowmedia'));

app.use(function(req, res, next){
    req.setTimeout(500000, function(){
        // call back function is called when request timed out.
    });
    next();
});

const server = http.createServer(app);
const clientServer = process.env.CLIENT_SERVER

const io = new Server(server, {
    cors:{
        origin:"http://localhost:3000", clientServer,
	    credentials: true,
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

app.get('/test',validateToken, async (req,res) => {
    const username = req.user.username;
    const user = await users.findOne({where: {username: username}});
    const phoneNumber = await user.dataValues.phoneNumber;
})

app.get('/test1', async (req,res) => {
    const client = new Client({
        authStrategy: new LocalAuth({clientId:'kenny'}),
        puppeteer: {headless: false,
        args: [ '--disable-gpu',
        '--disable-setuid-sandbox',
        '--no-sandbox'],
        executablePath: process.env.EXECUTE_PATH},
    });

    client.initialize().catch(_ => _)

        client.on('ready', async () => {
            let list = [{}]
             const tests = await client.getContacts();
            for(i=0; i<tests.length; i++){
                const test = tests[i];
                if (test.id.server == 'c.us'){
                    if(test.isBusiness == false){
                        list.push({
                            number: test.number,
                            name: test.name || test.pushname,
                        })
                    }else if(test.isBusiness == true && test.isEnterprise == false){
                        list.push({
                            number: test.number,
                            name: test.name || test.pushname,
                        })
                    }    
                }
            }
            res.json(list)
        })
    
        client.on('disconnected', async (reason) => {
            console.log(reason)
        })

             

        
})

app.get('/whatsapp-auth/', validateToken, async (req,res) => {

    try{

        const username = req.user.username;
        const user = await users.findOne({where: {username: username}});
        const phoneNumber = await user.dataValues.phoneNumber;
        const checkPath =  `./.wwebjs_auth/session-${username}`;
    
        if(checkPath){
            const deletePath = () => fs.rm(checkPath, {recursive: true, force: true})
            if(deletePath){
                console.log('here 1')
                const client = new Client({
                    authStrategy: new LocalAuth({clientId: username}),
                    puppeteer: {headless: false,
                    args: [ '--disable-gpu',
                     '--disable-setuid-sandbox',
                     '--no-sandbox'],
                     executablePath: process.env.EXECUTE_PATH}
                            });
    
                client.initialize();
    
                io.emit('message', 'Generating QR Code....')
                
                client.on('qr', (qr)  => {
                    try{
                        io.emit('qrvalue', qr);
                        io.emit('message', 'QR Code is generated, scan now to get started.')
                        io.emit('btnhide', 'hide');
                        io.emit('loading', '');
                    }
                    catch (err){
                        io.emit({error: err.message})
                    }      
                    
                })
    
                const deleteSession = async () => {
                    client.destroy();
                    const delayRemove = () => {
                        fs.rmSync(checkPath, {recursive: true, force: true});
                        io.emit( 'message' , 'whatsApp number must be the same as profile phone number.');
                        io.emit( 'error' , 'Error: Connected whatsApp number is not the same as your profile phone number.');
                        io.emit('qrvalue', ''); 
                    }
                    
                    setTimeout(delayRemove, 4000)
                         
                }
    
                client.on('ready', async () => {
    
                    const clientNumber = client.info.wid.user;
    
                    console.log(clientNumber)
                    console.log(phoneNumber)
    
                    if(clientNumber !== phoneNumber){
    
                        io.emit('qrvalue', '');
                        io.emit('message', 'Some error occured');
                        io.emit('loading', '');
                        setTimeout(deleteSession, 2000)
                    
                    }else{
                    io.emit('qrvalue', '');
                    io.emit('message', 'QR Scanned. Initializing authorized connection..' );
                    io.emit('loading', 'load');
                        const checkAuth = async () => {
                            const sessionPath = String(`./.wwebjs_auth/session-${username}`);
                            const existPath = fs.existsSync(sessionPath);
                        if(existPath){
    
                            await wsauth.create({
                                username: username,
                                status: 'ready',
                                clientNumber: clientNumber
                            }).then(() => {
                                io.emit('message', 'Session Stored');
                                io.emit('loading', '');
                                io.emit( 'success' , 'WhatsApp connected successfully.');
                            })
                            
                        const delay = () =>{
                            client.destroy();
                            io.emit('status','ready')
                        }
    
                        setTimeout(delay, 2000)
                        }else{
                            io.emit({error: "Failed to connect whatsApp. Please try again."})
                        }
                        }
                        setTimeout(checkAuth, 3000)
                    }
    
                    
                    });
                
            }
                
    
        }else{
            console.log('here 2')
            const client = new Client({
                authStrategy: new LocalAuth({clientId: username}),
                puppeteer: {headless: false,
                args: [ '--disable-gpu',
                 '--disable-setuid-sandbox',
                 '--no-sandbox'],
                 executablePath: process.env.EXECUTE_PATH}
                        });
    
            client.initialize();
            
            client.on('qr', (qr)  => {
                try{
                    io.emit('qrvalue', qr);
                    io.emit('message', 'QR Code is generated, scan now to get started.')
                    io.emit('btnhide', 'hide');
                    io.emit('loading', '');
                }
                catch (err){
                    io.emit({error: err.message})
                }      
                
            })
    
            const deleteSession = async () => {
                client.destroy();
                const delayRemove = () => {
                    fs.rmSync(checkPath, {recursive: true, force: true});
                    io.emit( 'message' , 'whatsApp number must be the same as profile phone number.');
                    io.emit( 'error' , 'Error: Connected whatsApp number is not the same as your profile phone number.');
                    io.emit('qrvalue', ''); 
                }
                
                setTimeout(delayRemove, 4000)
                     
            }
    
            client.on('ready', async () => {
    
                const clientNumber = client.info.wid.user;
                if(clientNumber !== phoneNumber){
    
                    io.emit('qrvalue', '');
                    io.emit('message', 'Some error occured');
                    io.emit('loading', '');
                    setTimeout(deleteSession, 2000)
                
                }else{
                io.emit('qrvalue', '');
                io.emit('message', 'QR Scanned. Initializing authorized connection..' );
                io.emit('loading', 'load');
                    const checkAuth = async () => {
                        const sessionPath = String(`./.wwebjs_auth/session-${username}`);
                        const existPath = fs.existsSync(sessionPath);
                    if(existPath){
    
                        await wsauth.create({
                            username: username,
                            status: 'ready',
                            clientNumber: clientNumber
                        }).then(() => {
                            io.emit('message', 'Session Stored');
                            io.emit('loading', '');
                            io.emit( 'success' , 'WhatsApp connected successfully.');
                        })
                        
                    const delay = () =>{
                        client.destroy();
                        io.emit('status','ready')
                    }
    
                    setTimeout(delay, 2000)
                    }else{
                        io.emit({error: "Failed to connect whatsApp. Please try again."})
                    }
                    }
                    setTimeout(checkAuth, 3000)
                }
    
                
                });
        } 

    }catch(err){
        console.log(err)
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
    fetch(`${process.env.THIS_SERVER}api/broadcast/restart/campaign`).then(() => {
        console.log(`Server start on port : ${process.env.SERVER_PORT}`)
    })
    })

})





