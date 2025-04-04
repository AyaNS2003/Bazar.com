const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());
const port = 4000; 

let catalog = JSON.parse(fs.readFileSync('catalog.json', 'utf8'));

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

  
app.post('/update/:id', (req, res) => {
    const {id} = req.params;
    const { quantity, price } = req.body;
    const result = catalog.find(item => item.id == id);
    if (result) {
        if (quantity != undefined) 
            result.quantity = quantity;
        if (price != undefined) 
            result.price = price;
        fs.writeFileSync('catalog.json', JSON.stringify(catalog, null, 2));
        res.status(200).send('Item updated successfully.');
        console.log("Item updated:", result);
    } else {
        res.status(404).send('Item not found.');
    }
});

app.listen(port,()=>{  
    console.log("Catalog server is running at 4000");
})