const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bvs3l.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()
app.use(express.json());
app.use(cors());
app.use(express.static('orders'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req,res) =>{
    res.send("hello from Mango...it's sweet!")
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const ordersCollection = client.db("creativeAgency").collection("allOrders");
  const serviceCollection = client.db("creativeAgency").collection("services");
  const reviewCollection = client.db("creativeAgency").collection("reviews");
  const adminCollection = client.db("creativeAgency").collection("admin")
  
  
  app.post('/addServices', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const newImg = req.files.file.data;
    const encImg = newImg.toString('base64');
    var projectfileS = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    }
    serviceCollection.insertOne({ title, description, projectfileS })
      .then(result => {
          console.log(result)
        res.send(result.insertedCount > 0)
      })
  })


  

  app.get('/services', (req, res) =>{
    serviceCollection.find({})
    .toArray( (err, documents) => {
        res.send(documents);
        
    })
})

app.get('/feedback', (req, res) => {
    reviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })


app.get('/clientOrder', (req, res) => {
    ordersCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/allOrders', (req, res)=>{
    ordersCollection.find({})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

  app.get('/admin', (req, res)=>{
    adminCollection.find({email: req.query.email})
    .toArray((err,documents) =>{
      res.send(documents)
    })
  
  })

  app.post('/makeAdmin', (req, res) => {
    const admin = req.body;
    console.log(admin);
    adminCollection.insertOne(admin)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
})

app.post('/isAdmin', (req, res) => {
  const email = req.body.email;
  adminCollection.find({email: email})
  .toArray((err, admin) => {
    res.send(admin.length > 0 );  
  })

   
})





  app.post('/addReview', (req, res) => {
      const reviews = req.body;
      console.log(reviews);
      reviewCollection.insertOne(reviews)
      .then(result => {
          res.send(result.insertedCount>0)
      })
  })



  app.post('/addanOrder', (req , res) =>{
      const file = req.files.file;
      const name = req.body.name;
      const email = req.body.email;
      const service = req.body.service;
      const price = req.body.price;
      const details = req.body.details;
      console.log(name,email,service,file,price,details);
      
      const newImg = req.files.file.data;
      const encImg =newImg.toString('base64');

      var projectfile ={
          contentType: req.files.file.mimetype,
          size: req.files.file.size,
          img: Buffer.from(encImg, 'base64')
      }

      ordersCollection.insertOne({name, email,service,price,details,projectfile})
      .then(result => {
              res.send(result.insertedCount > 0);

          })
  

      })
    //   return res.send({name: file.name, path: `/${file.name}`})
    
  
 
});



app.listen(process.env.PORT || port)