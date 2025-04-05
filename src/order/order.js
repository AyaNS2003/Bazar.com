const express = require('express')
const axios = require('axios')

var app = express()

var port = 3000

app.use(express.json())

app.post("/purchase/:id",async (req,res)=>{ 
    var book_id = req.params.id
    
    try{
        const qry = await axios.get('http://localhost:4000/info/' + book_id) //fetching book
        
        var bookData= qry.data;
        if(!bookData) {// book not found
            console.log('Book not found in catalog service');
            return res.status(404).json({ message: 'Book not found' });
        }

        console.log('Book fetched successfully to order service')

        if(bookData.quantity > 0){
            var newQuantity = bookData.quantity - 1
            var bookPrice = bookData.price

            const update = await axios.post('http://localhost:4000/update/' + book_id, 
                {quantity: newQuantity,
                price: bookPrice})//update book qty

            return res.status(200).json({ message: 'Book purchased successfully' });

        }//book can be purchased
        else{
            return res.status(400).json({ message: 'Book out of stock' });
        }//qty is 0 or less
        
    }
    catch(err){
        console.error(err.message);
        res.status(500).json({ message: 'Internal server error' });
    }   
})
  
app.get("",(req,res)=>{
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})
