import Airtable from 'airtable';
import type { Property } from '../types';
import { env } from '../config/env';
import { API_CONFIG } from '../config/constants';
import { handleServiceError } from '../utils/error';

// Initialize Airtable with environment variables
const base = new Airtable({ 
  apiKey: env.airtable.apiKey,
  endpointUrl: 'https://api.airtable.com'
}).base(env.airtable.baseId);

const mapRecordToProperty = (record: Airtable.Record<any>): Property => ({
  id: record.id,
  name: record.get('Name') as string || '',
  address: record.get('Address') as string || '',
  checkInTime: record.get('Check-in Time') as string || '',
  checkOutTime: record.get('Check-out Time') as string || '',
  maxGuests: record.get('Max Guests') as number || 0,
  accessCodes: {
    wifi: {
      name: record.get('WiFi Name') as string || '',
      password: record.get('WiFi Password') as string || ''
    },
    door: record.get('Door Code') as string || ''
  },
  amenities: (record.get('Amenities') as string[] || []),
  houseRules: (record.get('House Rules') as string[] || []),
  photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267']
});

export const airtableService = {
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
      return handleServiceError(error, 'Airtable.getProperties');
    }
  },

  async createProperty(data: Omit<Property, 'id'>): Promise<Property> {
    try {
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
        'Amenities': data.amenities
      });

      return mapRecordToProperty(record);
    } catch (error) {
      return handleServiceError(error, 'Airtable.createProperty');
    }
  },

  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    try {
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
        ...(data.amenities && { 'Amenities': data.amenities })
      });

      return mapRecordToProperty(record);
    } catch (error) {
      return handleServiceError(error, 'Airtable.updateProperty');
    }
  },

  async deleteProperty(id: string): Promise<{ success: boolean }> {
    try {
      await base('Properties').destroy(id);
      return { success: true };
    } catch (error) {
      return handleServiceError(error, 'Airtable.deleteProperty');
    }
  }
};