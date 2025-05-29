// frontend service.
const express = require('express');
const axios = require('axios');

const app = express();
const port = 5000;

app.use(express.json());

// In-memory cache
const cache = new Map();
const CACHE_LIMIT = 100;

// Round robin indices
let catalogIndex = 0;
let orderIndex = 0;

// Catalog and Order service replicas
const catalogReplicas = ['http://catalog1:4000', 'http://catalog2:4000'];
const orderReplicas = ['http://order1:3000', 'http://order2:3000'];

// Function to get the next catalog replica URL
function getCatalogReplica() {
    const url = catalogReplicas[catalogIndex];
    catalogIndex = (catalogIndex + 1) % catalogReplicas.length;
    return url;
}

// Function to get the next order replica URL
function getOrderReplica() {
    const url = orderReplicas[orderIndex];
    orderIndex = (orderIndex + 1) % orderReplicas.length;
    return url;
}

function setCache(key, value) {
    if (cache.size >= CACHE_LIMIT) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
    }
    cache.set(key, value);
}

app.get('/search/:topic', async (req, res) => {
    const topic = req.params.topic;

    // Check if the search results are already in cache
    if (cache.has(`search:${topic}`)) {
        return res.status(200).json(cache.get(`search:${topic}`));
    }

    // If not in cache, fetch from one of catalog service replicas
    try {

        const url = getCatalogReplica();
        const response = await axios.get(`${url}/search/${topic}`);
        setCache(`search:${topic}`, response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching search results:', error.message);
        res.status(500).json({ message: 'Error fetching search results' });
    }
});

app.get('/info/:book_id', async (req, res) => {
    const bookID = req.params.book_id;

    // Check if the book info is already in cache
    if (cache.has(`info:${bookID}`)) {
        console.log(`[CACHE HIT] info:${bookID}`);
        return res.status(200).json(cache.get(`info:${bookID}`));
    }

    // If not in cache, fetch from one of catalog service replicas
    try {
        const url = getCatalogReplica();
        const response = await axios.get(`${url}/info/${bookID}`);
        setCache(`info:${bookID}`, response.data);
        console.log(`[CACHE MISS] info:${bookID}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching info:', error.message);
        res.status(500).json({ message: 'Error fetching book info' });
    }
});

// Invalidate cache on purchase/update
app.post('/invalidate/:book_id', (req, res) => {
    const bookID = req.params.book_id;
    // Invalidate both info and search cache for this book
    cache.delete(`info:${bookID}`);
    console.log(`[CACHE INVALIDATE] info:${bookID}`);
    res.status(200).json({ message: `Cache for book ${bookID} invalidated.` });
});

app.post('/purchase/:book_id', async (req, res) => {
    const bookID = req.params.book_id;
    try {
        const url = getOrderReplica();
        const response = await axios.post(`${url}/purchase/${bookID}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error processing purchase:', error.message);
        res.status(500).json({ message: 'Error processing purchase' });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Frontend running on http://frontend:${port}`);
});
