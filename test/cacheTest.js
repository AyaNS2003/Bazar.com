const axios = require('axios');

async function measureTime(label, url, method = 'get') {
    const start = Date.now();
    try {
        if (method === 'post') {
            await axios.post(url);
        } else {
            await axios.get(url);
        }
    } catch (err) {
        console.error(`${label} failed:`, err.message);
    }
    const duration = Date.now() - start;
    console.log(`${label}: ${duration} ms`);
}

async function runTest() {
    console.log('Cache Invalidation Test\n');

    await measureTime('before purchase', 'http://localhost:5000/info/1');

    await measureTime('buy book', 'http://localhost:5000/purchase/1', 'post');

    await measureTime('after purchase', 'http://localhost:5000/info/1');
}

runTest();
