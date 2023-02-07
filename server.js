// Import dependecies module
const express = require('express');
var path = require('path');
var fs = require('fs');

// Create an server.js instance
const app = express();

// config Express.js
app.use(express.json())
app.set('port', 3000)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

// logger middleware
app.use(function (req, res, next) {
    console.log("Request IP: " + req.url);
    console.log("Request date: " + new Date());
    next();
});

// connect to MongoDB
const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://charulatha118:SugiCharu@gettingstarted.atf85nx.mongodb.net', (err, client) => {
    db = client.db('subpoint')
})

// display a message for root path to show that API is working
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages')
})

// get the collection name
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    // console.log('collection name:', req.collection)
    return next()
})

// get all the lessons form the lessons collection
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})

// post order to order collection
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insertOne(req.body, (e, results) => {
        if (e) return next(e)
        res.send(results.ops)
    })
})
// ops is an object identifier

// get lesson using id
const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
        if (e) return next(e)
        res.send(result)
    })
})

// put request to update available lessons
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.updateOne(
        { _id: new ObjectID(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (e, result) => {
            if (e) return next(e)
            res.send((result) ? { msg: 'success' } : { msg: 'error' })
        }
    )
})

// search
app.get('/collection/:collectionName/search/:searchTerm', (req,res) => {
    const { searchTerm } = req.params
    req.collection.find({}).toArray((err,results) => {
        if (err) return next(err)
        const lessons = results.filter(lesson => {
            return (
                lesson.subject.toLowerCase().match(searchTerm.toLowerCase()) 
                ||
                lesson.location.toLowerCase().match(searchTerm.toLowerCase())
            )
        })
        res.send(lessons)
    }) 
})

// static file server middleware
app.use(function (req, res, next) {
    // Uses path.join to find the path where the file should be
    var filePath = path.join(__dirname, "images", req.url);
    // Built-in fs.stat gets info about a file    
    fs.stat(filePath, function (err, fileInfo) {
        if (err) {
            next();
            return;
        }
        if (fileInfo.isFile()) res.sendFile(filePath);
        else next();
    });
});

// middleware error handler
app.use(function(req,res){
    res.status(404)
    res.send("Error! Not found!")
})

/*
app.use(function (req, response, next) {
    var filePath = path.join(__dirname, "/..", req.url);
    console.log(filePath);
    fs.stat(filePath, function (error, fileInfo) {
        if (error) {
            response.send("This file does not exist.");
            next();
            return;
        }
        if (fileInfo.isFile()) response.sendFile(filePath);
        else next();
    });
});
*/

app.listen(3000, () => {
    console.log('Server listening on port 3000')
})
