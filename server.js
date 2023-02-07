// Import dependecies module
const express = require('express');
var path = require('path');
var fs = require('fs');

// Create an server.js instance
const app = express();

// config Express.js
app.use(express.json())
app.set('port', 3000)
app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

// logger middleware
app.use(function(req, res, next) {
    console.log("Request IP: " + req.url);
    console.log("Request date: " + new Date());
    next();
});

// static file server middleware
app.use(function(req, res, next) {
    // Uses path.join to find the path where the file should be
    var filePath = path.join(__dirname, "images", req.url);
    // Built-in fs.stat gets info about a file    
    fs.stat(filePath, function(err, fileInfo) {
        if (err) {            
            next();
            return;        
        }
        if (fileInfo.isFile()) res.sendFile(filePath);
        else next();    
    });
});

// connect to MongoDB
const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://charulatha118:SugiCharu@gettingstarted.atf85nx.mongodb.net', (err,client) => {
    db = client.db('subpoint')
})

// display a message for root path to show that API is working
app.get('/', (req,res,next) => {
    res.send('Select a collection, e.g., /collection/messages')
})

// get the collection name
app.param('collectionName', (req,res,next,collectionName) => {
    req.collection = db.collection(collectionName)
    // console.log('collection name:', req.collection)
    return next()
})

app.get('/collection/:collectionName', (req,res,next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})

app.post('/collection/:collectionName', (req,res,next) => {
    req.collection.insertOne(req.body, (e, results) => {
        if (e) return next(e)
        res.send(results.ops)
    })
})
// ops is an object identifier

const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id', (req,res,next) => {
    req.collection.findOne({_id: new ObjectID(req.params.id)}, (e, result) => {
        if (e) return next(e)
        res.send(result)
    })
})

app.put('/collection/:collectionName/:id', (req,res,next) => {
    req.collection.updateOne(
        {_id: new ObjectID(req.params.id)},
        {$set: req.body},
        {safe: true, multi: false},
        (e, result) => {
            if (e) return next(e)
            res.send((result) ? {msg: 'success'} : {msg: 'error'})
        }
    )
})

app.delete('/collection/:collectionName/:id', (req,res,next) => {
    req.collection.deleteOne(
        {_id: ObjectID(req.params.id)},
        (e, result) => {
            if (e) return next(e)
            res.send((result) ? {msg: 'success'} : {msg: 'error'})
        }
    )
})

app.listen(3000, () => {
    console.log('Express.js server running at localhost:3000')
})