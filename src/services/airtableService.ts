import Airtable from 'airtable';
import type { Property } from '../types';
import { env } from '../config/env';
import { handleServiceError } from '../utils/error';

// Initialiser Airtable avec les variables d'environnement
const base = new Airtable({
  apiKey: env.airtable.apiKey,
  endpointUrl: 'https://api.airtable.com',
}).base(env.airtable.baseId);

// Mapper un enregistrement Airtable vers l'objet Property
const mapRecordToProperty = (record: Airtable.Record<any>): Property => ({
  id: record.id,
  name: (record.get('Name') as string) || '',
  address: (record.get('Address') as string) || '',
  checkInTime: (record.get('Check-in Time') as string) || '',
  checkOutTime: (record.get('Check-out Time') as string) || '',
  maxGuests: (record.get('Max Guests') as number) || 0,
  accessCodes: {
    wifi: {
      name: (record.get('WiFi Name') as string) || '',
      password: (record.get('WiFi Password') as string) || '',
    },
    door: (record.get('Door Code') as string) || '',
  },
  amenities: (record.get('Amenities') as string[]) || [],
  houseRules: (record.get('House Rules') as string[]) || [],
  photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
});

export const airtableService = {
  /**
   * Récupérer toutes les propriétés depuis Airtable.
   */
  async getProperties(): Promise<Property[]> {
    try {
      console.log('Fetching properties from Airtable...');
      const records = await base('Properties')
        .select({ view: 'Grid view' })
        .all();

      console.log(`Found ${records.length} properties`);
      return records.map(mapRecordToProperty);
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw handleServiceError(error, 'Airtable.getProperties');
    }
  },

  /**
   * Créer une nouvelle propriété dans Airtable.
   * @param data Les données de la propriété à créer.
   */
  async createProperty(data: Omit<Property, 'id'>): Promise<Property> {
    try {
      console.log('Creating a new property...');
      const record = await base('Properties').create({
        Name: data.name,
        Address: data.address,
        'Check-in Time': data.checkInTime,
        'Check-out Time': data.checkOutTime,
        'Max Guests': data.maxGuests,
        'WiFi Name': data.accessCodes.wifi.name,
        'WiFi Password': data.accessCodes.wifi.password,
        'Door Code': data.accessCodes.door,
        'House Rules': data.houseRules,
        'Amenities': data.amenities,
      });

      console.log('Property created successfully:', record.id);
      return mapRecordToProperty(record);
    } catch (error) {
      console.error('Error creating property:', error);
      throw handleServiceError(error, 'Airtable.createProperty');
    }
  },

  /**
   * Mettre à jour une propriété existante dans Airtable.
   * @param id L'identifiant de la propriété.
   * @param data Les champs à mettre à jour.
   */
  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    try {
      console.log(`Updating property with ID: ${id}...`);
      const record = await base('Properties').update(id, {
        ...(data.name && { Name: data.name }),
        ...(data.address && { Address: data.address }),
        ...(data.checkInTime && { 'Check-in Time': data.checkInTime }),
        ...(data.checkOutTime && { 'Check-out Time': data.checkOutTime }),
        ...(data.maxGuests && { 'Max Guests': data.maxGuests }),
        ...(data.accessCodes?.wifi.name && { 'WiFi Name': data.accessCodes.wifi.name }),
        ...(data.accessCodes?.wifi.password && { 'WiFi Password': data.accessCodes.wifi.password }),
        ...(data.accessCodes?.door && { 'Door Code': data.accessCodes.door }),
        ...(data.houseRules && { 'House Rules': data.houseRules }),
        ...(data.amenities && { 'Amenities': data.amenities }),
      });

      console.log('Property updated successfully:', record.id);
      return mapRecordToProperty(record);
    } catch (error) {
      console.error('Error updating property:', error);
      throw handleServiceError(error, 'Airtable.updateProperty');
    }
  },

  /**
   * Supprimer une propriété dans Airtable.
   * @param id L'identifiant de la propriété à supprimer.
   */
  async deleteProperty(id: string): Promise<{ success: boolean }> {
    try {
      console.log(`Deleting property with ID: ${id}...`);
      await base('Properties').destroy(id);
      console.log('Property deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error deleting property:', error);
      throw handleServiceError(error, 'Airtable.deleteProperty');
    }
  },
};
