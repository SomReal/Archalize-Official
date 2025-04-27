const axios = require('axios');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai'); // ✅ correct OpenAI import

dotenv.config();

const app = express();
app.use(cors({
  origin: ['https://www.archalize.com', 'http://localhost:3000'], // allow your production + dev
  methods: ['POST'],
}));
app.use(express.json({ limit: '10mb' }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Upload base64 image to Imgur
async function uploadToImgur(base64Image) {
  const response = await axios.post(
    'https://api.imgur.com/3/image',
    {
      image: base64Image,
      type: 'base64',
    },
    {
      headers: {
        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`, // ✅ using .env
      },
    }
  );
  return response.data.data.link;
}

// Critique API
app.post('/api/critique', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    const imageUrl = await uploadToImgur(imageBase64); // upload image to Imgur first

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert architecture critic. Critique this building's design focusing on:

- Architectural style
- Layout functionality
- Sustainability
- Aesthetic impact
- Improvements to the Design

Write in a clear and encouraging tone. Format into readable sections.`,
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    res.json({ critique: response.choices[0].message.content });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Something went wrong with AI critique." });
  }
});

// 👇 FINAL correct app.listen (ONLY ONE)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
  
