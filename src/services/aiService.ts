import OpenAI from 'openai';
import type { Message, Property } from '../types';
import { env } from '../config/env';
import { handleServiceError } from '../utils/error';

interface BookingContext {
  hasBooking: boolean;
  checkIn?: string;
  checkOut?: string;
}

// Initialisation du client OpenAI avec la clé API depuis les variables d'environnement
const openai = new OpenAI({
  apiKey: env.openai.apiKey,
});

// Générer le prompt pour le modèle OpenAI
const generateSystemPrompt = (property: Property, bookingContext: BookingContext): string => {
  // Construction du prompt pour fournir le contexte au modèle
  let prompt = `You are a helpful property manager assistant for ${property.name}. 
Here are the property details:
- Address: ${property.address}
- Check-in time: ${property.checkInTime}
- Check-out time: ${property.checkOutTime}
- Maximum guests: ${property.maxGuests}

${
  bookingContext.hasBooking
    ? `This guest has a confirmed booking:
- Check-in date: ${bookingContext.checkIn}
- Check-out date: ${bookingContext.checkOut}`
    : 'This guest has not made a booking yet.'
}

Provide concise, friendly responses to guest inquiries. Be professional and welcoming.`;

  return prompt;
};

export const aiService = {
  /**
   * Génère une réponse via OpenAI en fonction d'un message et des détails de la propriété.
   * @param message - Le message envoyé par le client.
   * @param property - Les détails de la propriété (nom, adresse, etc.).
   * @param bookingContext - Le contexte de réservation du client.
   * @returns Une réponse générée par OpenAI.
   */
  async generateResponse(
    message: Message,
    property: Property,
    bookingContext: BookingContext = { hasBooking: false }
  ): Promise<string> {
    try {
      console.log('Generating response for message:', message);
      console.log('Property details:', property);
      console.log('Booking context:', bookingContext);

      // Appel à l'API OpenAI pour générer une réponse
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-0125-preview', // Utiliser un modèle spécifique
        messages: [
          {
            role: 'system',
            content: generateSystemPrompt(property, bookingContext), // Contexte système
          },
          {
            role: 'user',
            content: `Guest message: "${message.text}"\n\nProvide a helpful response as the property manager.`,
          },
        ],
        temperature: 0.7, // Ajuste la créativité des réponses
        max_tokens: 150, // Limite le nombre de tokens générés
      });

      // Retourner la réponse générée par le modèle
      const aiResponse =
        completion.choices[0]?.message?.content ||
        "I apologize, but I couldn't generate a response at the moment. Please try again.";

      console.log('Generated AI response:', aiResponse);
      return aiResponse;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return handleServiceError(error, 'OpenAI.generateResponse');
    }
  },
};
