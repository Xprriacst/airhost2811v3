import { Handler } from '@netlify/functions';
import { aiService } from '../../src/services/aiService';
import { airtableService } from '../../src/services/airtableService';

interface IncomingMessage {
  message: string;
  sender: string;
  timestamp: string;
}

const MAKE_RESPONSE_WEBHOOK = 'https://hook.eu1.make.com/v44op53s8w0hlaoqlfrnfu35bd09i7g8';

export const handler: Handler = async (event) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  }

  try {
    console.log('Received webhook:', event.body);
    const data = JSON.parse(event.body || '{}') as IncomingMessage;

    // Get property for this sender
    const properties = await airtableService.getProperties();
    const property = properties[0]; // TODO: Implement proper property matching

    if (!property) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'No property found for this sender'
        }),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      };
    }

    // Generate AI response
    const aiResponse = await aiService.generateResponse({
      id: Date.now().toString(),
      text: data.message,
      isUser: true,
      timestamp: new Date(data.timestamp),
      sender: data.sender
    }, property);

    // Send response back through Make.com webhook
    const response = await fetch(MAKE_RESPONSE_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Body: aiResponse
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send response through Make.com webhook');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Message processed successfully'
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };

  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  }
};