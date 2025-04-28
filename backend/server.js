const axios = require('axios');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
app.use(cors({
    origin: (origin, callback) => {
      if (!origin || origin.startsWith('http://localhost') || origin === 'https://www.archalize.com') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
        Authorization: 'Client-ID 8dbb2ca438012eb', // 🛑 full "Client-ID xxxxx"
      },
    }
  );
  return response.data.data.link;
}

app.post('/api/critique', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    const imageUrl = await uploadToImgur(imageBase64);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an expert architecture critic. Critique this building's design focusing on:

- Architectural style
- Layout functionality
- Sustainability
- Aesthetic impact
- Improvements to the Design

Write clearly and break into nice sections.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    res.json({ critique: response.choices[0].message.content });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ critique: null });
  }
});

// 🛠 THIS IS THE CORRECT ONE
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
