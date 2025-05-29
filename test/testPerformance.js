const axios = require('axios');

const NUM_REQUESTS = 100;
const URL = 'http://localhost:5000/info/1';

async function sendRequest(url) {
    const start = Date.now();
    try {
        await axios.get(url);
    } catch (err) {
        console.error('Request failed:', err.message);
    }
    return Date.now() - start;
}

async function testPerformance(label, clearCache = false) {
    let totalTime = 0;
    for (let i = 0; i < NUM_REQUESTS; i++) {
        if (clearCache) {
            // Invalidate cache before each request (adjust endpoint as needed)
            try {
                await axios.post('http://localhost:5000/invalidate/1');
            } catch (err) {
                console.error('Cache invalidation failed:', err.message);
            }
        }
        const time = await sendRequest(URL);
        totalTime += time;
    }
    const avgTime = totalTime / NUM_REQUESTS;
    console.log(`\n${label} - Average Response Time: ${avgTime.toFixed(2)} ms`);
}

async function main() {
    console.log('--- Performance Test Starting ---');

    console.log('\n Without Cache');
    await testPerformance('Cold', true);

    console.log('With Cache');
    // Warm up cache once, then test repeated hits
    await axios.get(URL);
    await testPerformance('Warm', false);
}

main();