//console.log('May Node be with you')
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');

const MongoClient = require('mongodb').MongoClient;

const uri = 'mongodb+srv://dangletuankiet73:1@cluster0.iaokgvd.mongodb.net/';

// Connect to MongoDB Atlas 
MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB Atlas');

    const db = client.db('product-inventory');
    const products = db.collection('products');

    
    app.set('view engine', 'ejs');

    // Set up middleware to parse request bodies as JSON and form data
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // Set up middleware to serve static files from the "public" directory
    app.use('/public', express.static(path.join(__dirname, 'public')));

    // Set up a route to show all products
    app.get('/', (req, res) => {
      products.find().toArray((err, results) => {
        if (err) throw err;
        res.render('index', { products: results });
      });
    });

    // Set up a route to add a new product
    app.post('/product', (req, res) => {
      const { name, price } = req.body;
      products.insertOne({ name, price: parseFloat(price) }, (err, result) => {
        if (err) throw err;
        console.log('Product added: ', name, price);
        res.redirect('/');
      });
    });

    // Set up a route to search for products
    app.get('/search', (req, res) => {
      const query = req.query.q;
      products.find({ name: { $regex: query, $options: 'i' } }).toArray((err, results) => {
        if (err) throw err;
        res.render('search', { query, products: results });
      });
    });

    // Start the server
    app.listen(3000, () => {
      console.log('Server listening on port 3000');
    });
  })
  .catch(err => {
    console.log('Error connecting to MongoDB Atlas', err);
  });
