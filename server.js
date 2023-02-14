// Import dependecies module
const express = require('express');
var path = require('path');
var fs = require('fs');
var cors = require('cors')

// Create an server.js instance
const app = express();

// config Express.js
app.use(express.json())
app.use(cors());
app.set('port', 3000)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

// logger middleware
app.use(function (req, res, next) {
    console.log("Request IP: " + req.method + " request to: " + req.url);
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
app.get(
    "/collection/:collectionName/:search",
    (req, res, next) => {
      console.log(req.params.search);
      // finding the objects using $or (or) condition with subject or location
      // using $regex to cgeck if a object contains the specific string or character
      // $options=i to check the Case insensitivity
      req.collection
        .find({
          $or: [
            {
              subject: {
                $regex: "^" + req.params.search,
                $options: "i",
              },
            },
            {
              location: {
                $regex: "^" + req.params.search,
                $options: "i",
              },
            },
          ],
        })
        .toArray((e, results) => {
          if (e) return next(e);
          console.log(results);
          res.send(JSON.parse(JSON.stringify(results)));
        });
    }
  );
  
  
// get lesson using id
const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
        if (e) return next(e)
        res.send(result)
    })
})

app.put("/collection/:collectionName/:id", (req, res, next) => {
    req.collection.updateOne(
      { _id: new ObjectID(req.params.id) },
      { $set: req.body },
      { safe: true, multi: false },
      (e, result) => {
        if (e) return next(e);
        res.send(result.modifiedCount === 1 ? { msg: "success" } : { msg: "error" });
      }
    );
  });

//  Search


// static file server middleware
// app.use(function (req, res, next) {
//     // Uses path.join to find the path where the file should be
//     var filePath = path.join(__dirname, "assets", req.url);
//     // Built-in fs.stat gets info about a file    
//     fs.stat(filePath, function (err, fileInfo) {
//         if (err) {
//             next();
//             return;
//         }
//         if (fileInfo.isFile()) res.sendFile(filePath);
//         else next();
//     });
// });

// // middleware error handler
// app.use(function(req,res){
//     res.status(404)
//     res.send("Error! Not found!")
// })


app.use(function (req, response, next) {
    var filePath = path.join(__dirname, "assets", req.url);
    console.log(filePath);
    fs.stat(filePath, function (error, fileInfo) {
        if (error) {
            response.send("Error! This file does not exist.");
            next();
            return;
        }
        if (fileInfo.isFile()) response.sendFile(filePath);
        else next();
    });
});


app.listen(3000, () => {
    console.log('Server listening on port 3000')
})

// how to search using express.js and mongodb?
// search a product by name
// productRoute.get('/getproduct/:name', async (req,res) => {
//     try {
//         const findname = req.params.name;
//         const objs = await Product.find({productName:{ $regex:'.*'+findname+'.*'} });
//         res.json(objs);
//     } catch (error) {
//         res.json({message: error});        
//     }
// })


// [ { _id: 5f79,
//     productName: 'Test-image12345',
//     price: 60,
//     details: 'Test product' },
//   { _id: 5f7d,
//     productName: 'Test-image1234',
//     price: 60,
//     details: 'Test product'}
// ]




//Source: https://stackoverflow.com/questions/64287536


