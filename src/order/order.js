const express = require('express')
const axios = require('axios')
const fs = require('fs')
var app = express()

var port = 3000

app.use(express.json())

app.post("/purchase/:id",async (req,res)=>{ 
    var book_id = req.params.id
    
    try{
        const qry = await axios.get('http://catalog:4000/info/' + book_id) //fetching book
        
        var bookData= qry.data;
        console.log(bookData.data)
        if(bookData == undefined) {// book not found
            console.log('Book not found in catalog service');
            return res.status(404).json({ message: 'Book not found' });
        }

        console.log('Book fetched successfully to order service')
        var newQuantity = bookData.quantity
        var bookPrice = bookData.price
        var state
        var response

        if(bookData.quantity > 0){
            newQuantity = bookData.quantity - 1
            state = "succeeded"
            
            const update = await axios.post('http://catalog:4000/update/' + book_id, 
                {quantity: newQuantity,
                price: bookPrice})//update book qty

            response = res.status(200).json({ message: 'Book purchased successfully' });

        }//book can be purchased
        else{
            state = "failed"
            response = res.status(400).json({ message: 'Book out of stock' });
        }//qty is 0 

        var order = {
            "title": bookData.title,
            "newQuantity": newQuantity,
            "price": bookPrice,
            "state": state,
        }
        
        //adding order to file
        var orders = [];
        fs.readFile('src/order/orders.json', 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            }
            else {
                orders = JSON.parse(data);
                orders.push(order);
                fs.writeFile('src/order/orders.json', JSON.stringify(orders,null,2), function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Order added to file successfully!');
                    }
                });
            }
        });
        return response
    }
    catch(err){
        console.error(err.message);
        res.status(500).json({ message: 'Internal server error' });
    }   
})
  
app.get("",(req,res)=>{
})

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://order:${port}`);
})
