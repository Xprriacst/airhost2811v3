import { Handler } from '@netlify/functions';
import { aiService } from '../../src/services/aiService';
import { airtableService } from '../../src/services/airtableService';
import { whatsappMessageSchema } from '../../src/types/webhook';
import type { WhatsappMessage, WhatsappResponsePayload } from '../../src/types/webhook';

const MAKE_RESPONSE_WEBHOOK = 'https://hook.eu1.make.com/v44op53s8w0hlaoqlfrnfu35bd09i7g8';

export const handler: Handler = async (event) => {
  // Gestion des requêtes CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Vérifier que seule la méthode POST est autorisée
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    };
  }

  try {
    console.log('Received webhook payload:', event.body);

    // Parser et valider les données entrantes
    const data = JSON.parse(event.body || '{}');
    const validatedMessage = whatsappMessageSchema.parse(data);

    console.log('Validated message:', validatedMessage);

    // Récupérer la propriété correspondant à l'expéditeur
    const properties = await airtableService.getProperties();
    const property = properties[0]; // TODO: Implémentez une logique pour matcher l'expéditeur avec une propriété

    if (!property) {
      console.error('No property found for sender');
      return {
        statusCode: 404,
        body: JSON.stringify({
          success: false,
          error: 'No property found for this sender',
        }),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      };
    }

    // Générer une réponse via le service AI
    const aiResponse = await aiService.generateResponse(
      {
        id: Date.now().toString(),
        text: validatedMessage.message,
        isUser: true,
        timestamp: new Date(validatedMessage.timestamp),
        sender: validatedMessage.sender,
      },
      property
    );

    // Préparer la charge utile pour le webhook Make.com
    const responsePayload: WhatsappResponsePayload = {
      Body: aiResponse,
    };

    // Envoyer la réponse au webhook Make.com
    const response = await fetch(MAKE_RESPONSE_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responsePayload),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send response through Make.com webhook: ${response.statusText}`
      );
    }

    // Retourner une réponse réussie
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Message processed successfully',
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    };
  }
};

