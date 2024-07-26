const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

const accessToken = process.env.ACCESS_TOKEN;


const fetchProducts = async (company, category, top, minPrice, maxPrice) => {
  const url = `http://20.244.56.144/test/companies/${company}/categories/${category}/products?top=${top}&minPrice=${minPrice}&maxPrice=${maxPrice}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from external API:', error.message);
    throw error;
  }
};

app.get('/categories/:categoryname/products', async (req, res) => {
  const { categoryname } = req.params;
  const n = parseInt(req.query.n) || 10;
  const page = parseInt(req.query.page) || 1;
  const sortBy = req.query.sort_by || 'price';
  const order = req.query.order || 'asc';
  const minPrice = req.query.minPrice || 0;
  const maxPrice = req.query.maxPrice || 10000;
  const company = req.query.company || 'AMZ';

  try {
    const products = await fetchProducts(company, categoryname, n, minPrice, maxPrice);

    const sortedProducts = products.sort((a, b) => {
      if (order === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });


    const start = (page - 1) * n;
    const paginatedProducts = sortedProducts.slice(start, start + n);

    res.json(paginatedProducts);
  } catch (error) {
    console.error('Error in /categories/:categoryname/products endpoint:', error.message);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

app.get('/categories/:categoryname/products/:productid', async (req, res) => {
  const { categoryname, productid } = req.params;
  const company = req.query.company || 'AMZ';

  try {
    const products = await fetchProducts(company, categoryname, 100, 0, 10000);
    const product = products.find(p => p.id === productid);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error in /categories/:categoryname/products/:productid endpoint:', error.message);
    res.status(500).json({ error: 'Error fetching product details' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
