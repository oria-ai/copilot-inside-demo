import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Load system prompt from file
async function loadSystemPrompt() {
  try {
    const promptPath = path.join(process.cwd(), 'prompts', 'task1.txt');
    const systemPrompt = await fs.readFile(promptPath, 'utf-8');
    return systemPrompt;
  } catch (error) {
    console.error('Error loading system prompt:', error);
    return 'You are a helpful assistant.'; // Fallback prompt
  }
}

// Gemini chat endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { userMessage } = req.body;
    
    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request. Please provide a userMessage.' 
      });
    }

    // Load system prompt
    const systemPrompt = await loadSystemPrompt();
    
    // Create the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Combine system prompt with user message
    const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`;
    
    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Send response back to frontend
    res.json({ 
      response: text,
      status: 'success'
    });
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      message: error.message,
      fullError: error,
      stack: error.stack
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});