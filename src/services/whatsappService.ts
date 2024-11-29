import axios from 'axios';
import { WhatsappMessage, WebhookResponse } from '../types/webhook';
import { whatsappMessageSchema } from '../types/webhook';
import { aiService } from './aiService';
import { airtableService } from './airtableService';

const MAKE_RESPONSE_WEBHOOK = 'https://hook.eu1.make.com/v44op53s8w0hlaoqlfrnfu35bd09i7g8';

export const whatsappService = {
  async handleIncomingMessage(data: WhatsappMessage): Promise<WebhookResponse> {
    try {
      // Validate incoming message
      const validatedData = whatsappMessageSchema.parse(data);
      console.log('Received WhatsApp message:', validatedData);

      // Get property and booking context
      const property = await this.getPropertyForSender(validatedData.sender);
      
      if (!property) {
        return {
          success: false,
          error: 'No property found for this sender'
        };
      }

      // Check if auto-pilot is enabled
      const isAutoPilot = await this.isAutoPilotEnabled(property.id);

      if (isAutoPilot) {
        // Generate AI response
        const aiResponse = await aiService.generateResponse({
          id: Date.now().toString(),
          text: validatedData.message,
          isUser: true,
          timestamp: new Date(validatedData.timestamp),
          sender: validatedData.sender
        }, property);

        // Send response via Make webhook
        await this.sendResponse(aiResponse);
      }

      return {
        success: true,
        message: 'Message processed successfully'
      };
    } catch (error) {
      console.error('Error handling WhatsApp message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  async sendResponse(message: string): Promise<void> {
    try {
      await axios.post(MAKE_RESPONSE_WEBHOOK, {
        Body: message
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Response sent successfully');
    } catch (error) {
      console.error('Error sending response:', error);
      throw error;
    }
  },

  async getPropertyForSender(sender: string) {
    try {
      // Get all properties from Airtable
      const properties = await airtableService.getProperties();
      // For now, return the first property (you'll need to implement proper matching logic)
      return properties[0];
    } catch (error) {
      console.error('Error getting property for sender:', error);
      return null;
    }
  },

  async isAutoPilotEnabled(propertyId: string): Promise<boolean> {
    try {
      // Get auto-pilot setting from Airtable
      // For now, return true (you'll need to implement proper setting retrieval)
      return true;
    } catch (error) {
      console.error('Error checking auto-pilot status:', error);
      return false;
    }
  }
};