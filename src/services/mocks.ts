import { IStorageService, ICalendarService, INotificationService } from './interfaces';
import fs from 'fs';
import path from 'path';

export class MockStorageService implements IStorageService {
  private storageDir = path.join(process.cwd(), 'mock_storage');

  constructor() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir);
    }
  }

  async uploadFile(file: Buffer, key: string): Promise<string> {
    console.log(`[MockStorage] Uploading ${key}`);
    const filePath = path.join(this.storageDir, key);
    fs.writeFileSync(filePath, file);
    return key;
  }

  async getDownloadUrl(key: string): Promise<string> {
    return `file://${path.join(this.storageDir, key)}`;
  }
}

export class MockCalendarService implements ICalendarService {
  async createEvent(providerEmail: string, clientEmail: string, startTime: Date, endTime: Date): Promise<{ eventId: string; meetLink: string }> {
    const eventId = `mock_event_${Math.random().toString(36).substr(2, 9)}`;
    const meetLink = `https://meet.google.com/mock-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}`;
    console.log(`[MockCalendar] Created event ${eventId} with link ${meetLink}`);
    return { eventId, meetLink };
  }

  async deleteEvent(eventId: string): Promise<void> {
    console.log(`[MockCalendar] Deleted event ${eventId}`);
  }
}

export class MockNotificationService implements INotificationService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`[MockEmail] To: ${to}, Subject: ${subject}, Body: ${body}`);
  }

  async sendInApp(userId: string, title: string, message: string): Promise<void> {
    console.log(`[MockInApp] User: ${userId}, Title: ${title}, Message: ${message}`);
  }
}
