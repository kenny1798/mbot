const { verify } = require('jsonwebtoken');
require('dotenv').config();

const validateToken = (req, res, next) => {
    const accessToken = req.header("accessToken");

    if (!accessToken) {
    return res.status(401).json({ error: "User not Logged In"});
    }
    try{
        const validToken = verify(accessToken, process.env.JWT_SECRET);
        req.user = validToken;
        if (validToken){
            return next();
        }
    }catch (err){
        return res.status(403).send({ error: err })
    }
};

const validateAdmin = (req, res, next) => {
    const adminToken = req.header("adminToken");

    if (!adminToken) {
    return res.status(401).json({ error: "Unauthorized User"});
    }
    try{
        const validToken = verify(adminToken, process.env.JWT_SECRET);
        req.admin = validToken;
        if (validToken){
            return next();
        }
    }catch (err){
        return res.status(403).send({ error: err })
    }
};

const verifyToken = (req, res, next) => {
    const valToken = req.header("valToken");

    if (!valToken) {
    return res.status(401).json({ error: "User not validate"});
    }
    try{
        const verifiedToken = verify(valToken, process.env.JWT_ACCESS);
        req.user = verifiedToken;
        if (verifiedToken){
            return next();
        }
    }catch (err){
        return res.status(403).send({ error: err })
    }
};

module.exports = {validateToken, verifyToken, validateAdmin};