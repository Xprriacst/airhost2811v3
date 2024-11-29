import { Handler } from '@netlify/functions';
import { aiService } from '../../src/services/aiService';
import { airtableService } from '../../src/services/airtableService';

export const handler: Handler = async (event) => {
  console.log('Received event:', event);

  // Gérer les requêtes CORS
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  try {
    console.log('Parsing event body...');
    const body = JSON.parse(event.body || '{}');
    console.log('Body parsed:', body);

    // Appels aux services en parallèle
    console.log('Calling OpenAI and Airtable services...');
    const [aiResponse, airtableResponse] = await Promise.all([
      aiService.processMessage(body.message),
      airtableService.saveMessage({
        message: body.message,
        sender: body.sender,
        timestamp: body.timestamp,
      }),
    ]);

    console.log('Responses received:', { aiResponse, airtableResponse });

    // Réponse réussie
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Message processed successfully',
        aiResponse,
        airtableResponse,
      }),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        message: 'An error occurred while processing the request',
        error: error.message,
      }),
    };
  }
};
