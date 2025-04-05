const express = require('express')
const axios = require('axios')

var app = express()

var port = 3000

app.use(express.json())

app.post("/purchase/:id",async (req,res)=>{ 
    var book_id = req.params.id
    
    try{
        const response = await axios.get('http://catalog:4000/info/' + book_id) 
        var responseData = response.data;
        console.log('Book fetched successfully to order service');
        console.log(responseData);
        
    }
    catch(err){
        console.error('Error fetching data:', err.message);
        res.status(500).json({ message: 'Internal server error' });
    }   
})
  
app.get("",(req,res)=>{
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})
