const express = require('express')
const axios = require('axios')

const app = express()
const port = 5000

app.use(express.json())

app.get('/search/:topic', async (req, res) => {
    const topic = req.params.topic
    try {
        const response = await axios.get(`http://localhost:4000/search/${topic}`)
        res.status(200).json(response.data)
    } catch (error) {
        console.error('Error fetching search results:', error.message)
        res.status(500).json({ message: 'Error fetching search results' })
    }
})

app.get('/info/:book_id', async (req, res) => {
    const bookID = req.params.book_id
    try {
        const response = await axios.get(`http://localhost:4000/info/${bookID}`)
        res.status(200).json(response.data)
    } catch (error) {
        console.error('Error fetching search results:', error.message)
        res.status(500).json({ message: 'Error fetching search results' })
    }
})

app.post('/purchase/:book_id', async (req, res) => {
    const bookID = req.params.book_id
    try {
        const response = await axios.post(`http://localhost:3000/purchase/${bookID}`)
        res.status(200).json(response.data)
    } catch (error) {
        console.error('Error fetching search results:', error.message)
        res.status(500).json({ message: 'Error fetching search results' })
    }
})


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})
