import { Handler } from '@netlify/functions';
import { aiService } from '../../src/services/aiService';
import { airtableService } from '../../src/services/airtableService';
import { whatsappMessageSchema } from '../../src/types/webhook';
import type { WhatsappMessage, WhatsappResponsePayload } from '../../src/types/webhook';

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
    console.log('Received webhook payload:', event.body);
    
    // Parse and validate incoming message
    const data = JSON.parse(event.body || '{}');
    const validatedMessage = whatsappMessageSchema.parse(data);
    
    console.log('Validated message:', validatedMessage);

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
      text: validatedMessage.message,
      isUser: true,
      timestamp: new Date(validatedMessage.timestamp),
      sender: validatedMessage.sender
    }, property);

    // Prepare response payload for Make.com webhook
    const responsePayload: WhatsappResponsePayload = {
      Body: aiResponse
    };

    // Send response through Make.com webhook
    const response = await fetch(MAKE_RESPONSE_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(responsePayload)
    });

    if (!response.ok) {
      throw new Error(`Failed to send response through Make.com webhook: ${response.statusText}`);
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
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    };
  }
};
