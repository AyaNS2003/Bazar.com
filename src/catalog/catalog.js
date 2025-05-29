// catalog service.
const express = require('express');
const fs = require('fs');
const axios = require('axios')
const app = express();
app.use(express.json());
const port = 4000; 

// Load catalog data from JSON file
let catalog = JSON.parse(fs.readFileSync('/app/catalog.json', 'utf8'));

// Endpoint to get books by topic
app.get('/search/:topic', (req, res) => {
    const {topic} = req.params;
    const result = catalog.filter(item => item.topic == topic);
    if (result.length > 0) {
        const simplified = result.map(b => ({ id: b.id, title: b.title }));
        res.status(200).json(simplified);
        console.log("Search results:", simplified);
    } else {
        res.status(404).send('No items found for the given topic.');
    }
  });

// Endpoint to get information about a specific book by ID
app.get('/info/:id', (req, res) => {
    const {id} = req.params;
    const result = catalog.find(item => item.id == id);
    if (result) {
        res.status(200).json(result);
        console.log("Item found:", result);
    } else {
        res.status(404).send('Item not found.');
    }
});

// Endpoint to update book by ID
app.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { quantity, price, internal } = req.body;
    const result = catalog.find(item => item.id == id);

    // Check if the book exists in the catalog
    if (result) {
        if (quantity !== undefined) result.quantity = quantity;
        if (price !== undefined) result.price = price;

        fs.writeFileSync('/app/catalog.json', JSON.stringify(catalog, null, 2));

        if (!internal) {
            const otherReplica = process.env.REPLICA === 'catalog1'
                ? 'http://catalog2:4000'
                : 'http://catalog1:4000';
            console.log('you are inside ', process.env.REPLICA, " other replica is ", otherReplica)
            axios.post(`${otherReplica}/update/${id}`, { quantity, price, internal: true  })
                .catch(err => console.error('Sync error:', err.message));
        }

        // Invalidate cache in frontend service
        try {
            await axios.post(`http://frontend:5000/invalidate/${id}`);
            console.log(`Cache for book ${id} invalidated on frontend.`);
        } catch (err) {
            console.error('Failed to invalidate cache in frontend:', err.message);
        }

        res.status(200).send('Item updated successfully.');
        console.log("Item updated:", result);
    } else {
        res.status(404).send('Item not found.');
    }
});


app.listen(port,()=>{  
    console.log("Catalog server is running at 4000");
})