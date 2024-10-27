const express = require('express');
const path = require('path');
const axios = require('axios'); 

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const orders = {
    '12345': { status: 'Shipped', deliveryDate: '2024-10-30', trackingNumber: 'TRACK123' },
    '67890': { status: 'Processing', deliveryDate: '2024-11-05', trackingNumber: '' },
};


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/order/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const order = orders[orderId];

    if (order) {
        res.json({ orderId, ...order });
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

app.post('/webhook', (req, res) => {
    const orderId = req.body.queryResult.parameters.orderId;
    const order = orders[orderId];

    if (order) {
        res.json({
            fulfillmentText: `Order ID: ${orderId}\nStatus: ${order.status}\nDelivery Date: ${order.deliveryDate}\nTracking Number: ${order.trackingNumber}`,
        });
    } else {
        res.json({
            fulfillmentText: 'Sorry, I could not find that order. Please check the Order ID.',
        });
    }
});


app.post('/chatgpt', async (req, res) => {
    const prompt = req.body.prompt; 
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch response from ChatGPT' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
