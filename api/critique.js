import { OpenAI } from 'openai';
import axios from 'axios';

const openaiApiKey = process.env.OPENAI_API_KEY;
const imgurClientId = process.env.IMGUR_CLIENT_ID;

if (!openaiApiKey) {
  throw new Error('OPENAI_API_KEY is missing in environment variables');
}

if (!imgurClientId) {
  throw new Error('IMGUR_CLIENT_ID is missing in environment variables');
}

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

// Export the API route handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' }); // use JSON always
  }

  try {
    const { imageBase64 } = req.body;
    console.log('Step 1: Got imageBase64');
  
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }
  
    // Upload image to Imgur
    const imgurResponse = await axios.post(
      'https://api.imgur.com/3/image',
      {
        image: imageBase64,
        type: 'base64',
      },
      {
        headers: {
          Authorization: `Client-ID ${imgurClientId}`,
        },
      }
    );
    console.log('Step 2: Uploaded to Imgur');
  
    const imageUrl = imgurResponse.data.data.link;
    console.log('Step 3: Got Imgur link', imageUrl);
  
    // Ask OpenAI for critique
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an expert architecture critic. Critique this building design focusing on:
  
  - Architectural style
  - Layout functionality
  - Sustainability
  - Aesthetic impact
  - Improvements to the Design
  
  Write clearly, in nice sections, easy to read.`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });
    console.log('Step 4: Got OpenAI response');
  
    res.status(200).json({ critique: response.choices[0].message.content });
  
  } catch (error) {
    console.error('🔥 Server error caught: ', error.response?.data || error.message);
    res.status(500).json({ critique: null });
  }
  
}
