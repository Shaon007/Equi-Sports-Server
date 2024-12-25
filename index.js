const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// ID pass with env setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mycluster1.rs796.mongodb.net/?retryWrites=true&w=majority&appName=myCluster1`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(cors());
app.use(express.json());

async function run() {
  try {
    // await client.connect();

    const productCollection = client.db('productDB').collection('product');

    // Get all products
    app.get('/product', async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get products by user email
    app.get('/products-by-email', async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send({ error: 'Email query parameter is required.' });
      }

      try {
        const cursor = productCollection.find({ userEmail: email });
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching products by email:', error);
        res.status(500).send({ error: 'Failed to fetch products.' });
      }
    });

    // Update a product by ID
    app.put('/product/:id', async (req, res) => {
      const { id } = req.params;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateProduct = req.body;

      const product = {
        $set: {
          name: updateProduct.name,
          processing: updateProduct.processing,
          customization: updateProduct.customization,
          rating: updateProduct.rating,
          stock: updateProduct.stock,
          category: updateProduct.category,
          details: updateProduct.details,
          photo: updateProduct.photo,
          price: updateProduct.price,
        },
      };

      const result = await productCollection.updateOne(filter, product, options);
      res.send(result);
    });

    // Get a product by ID
    app.get('/product/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const product = await productCollection.findOne({ _id: new ObjectId(id) });
        if (product) {
          res.json(product);
        } else {
          res.status(404).send({ error: 'Product not found' });
        }
      } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).send({ error: 'Failed to fetch product' });
      }
    });

    // Add a new product
    app.post('/product', async (req, res) => {
      const newProduct = req.body;
      // console.log(newProduct);
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    // Delete a product by ID
    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// Default route
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
