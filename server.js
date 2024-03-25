const express = require('express');
const bodyParser = require('body-parser');
const { performScans } = require('./your_script');

const app = express();
const port = 5000;

app.use(bodyParser.json());

app.post('/start-scan', async (req, res) => {
    const { url } = req.body;
    try {
        // Call your existing function to perform scans
        const result = await performScans(false, url, [], '', false);
        res.json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
