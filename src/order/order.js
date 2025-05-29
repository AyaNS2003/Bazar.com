const express = require('express');
const axios = require('axios');
const fs = require('fs');
const app = express();

const port = 3000;

app.use(express.json());

const catalogReplicas = ['http://catalog1:4000', 'http://catalog2:4000'];
let catalogIndex = 0;

//implementing round robin for load balancing
function getCatalogReplica() {
    const url = catalogReplicas[catalogIndex];
    catalogIndex = (catalogIndex + 1) % catalogReplicas.length;
    return url;
}

app.post("/purchase/:id", async (req, res) => {
    const book_id = req.params.id;

    try {
        // Use round-robin to select one of catalog replicas
        const catalogURL = getCatalogReplica();
        const qry = await axios.get(`${catalogURL}/info/${book_id}`);

        var bookData = qry.data;
         if(bookData == undefined) {// book not found
            console.log('Book not found in catalog service');
            return res.status(404).json({ message: 'Book not found' });
        }

        console.log('Book fetched successfully from catalog:', bookData);

        var newQuantity = bookData.quantity
        var bookPrice = bookData.price
        var state
        var response

        if (bookData.quantity > 0) {
            newQuantity = bookData.quantity - 1;
            state = "succeeded";

            //invalidating the frontend cache due to new updates
            await axios.post(`http://frontend:5000/invalidate/${book_id}`);

            //sending changes to catalog replicas
            await axios.post(`http://catalog1:4000/update/${book_id}`, {
                quantity: newQuantity,
                price: bookPrice,
                internal: false
            });

            await axios.post(`http://catalog2:4000/update/${book_id}`, {
                quantity: newQuantity,
                price: bookPrice,
                internal: false
            });

            response = res.status(200).json({ message: 'Book purchased successfully' });

        } //book can be purchased
        else {
            state = "failed";
            response = res.status(400).json({ message: 'Book out of stock' });
        }//qty is 0 

        // Build order record
        var order = {
            title: bookData.title,
            newQuantity: newQuantity,
            price: bookPrice,
            state: state
        };

        fs.readFile('/app/orders.json', 'utf8', (err, data) => {
            let orders = [];
            if (!err && data) {
                orders = JSON.parse(data);
            }
            orders.push(order);

            //writing to the container file 
            fs.writeFile('/app/orders.json', JSON.stringify(orders, null, 2), (err) => {
                if (err) {
                    console.error('Error writing order:', err);
                } else {
                    console.log('Order saved:', order);
                }
            });
        });

        return response
    } 
    catch (err) {
        if (err.response && err.response.status === 404) {
            console.log('Book not found in catalog service');
            return res.status(404).json({ message: 'Book not found' });
        }
        console.error('Error during purchase:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Order service running at http://order:${port}`);
});