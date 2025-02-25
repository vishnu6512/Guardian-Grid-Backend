require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const router = require('./routes/router')
const db = require('./database/db')


const ggServer = express()
ggServer.use(cors())
ggServer.use(express.json())
ggServer.use(router)

const PORT = process.env.PORT || 3000
ggServer.listen(PORT,()=>{
    console.log(`My server is running on port ${PORT}`);
})

ggServer.get('/',(req,res)=>{
    res.status(200).send(`<h1> My Server is running and waiting for client requests </h1>`)
})

ggServer.post('/',(req,res)=>{
    res.status(200).send("Post request")
})

