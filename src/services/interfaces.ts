export interface IStorageService {
  uploadFile(file: Buffer, key: string): Promise<string>;
  getDownloadUrl(key: string): Promise<string>;
}

export interface ICalendarService {
  createEvent(providerEmail: string, clientEmail: string, startTime: Date, endTime: Date): Promise<{ eventId: string; meetLink: string }>;
  deleteEvent(eventId: string): Promise<void>;
}

export interface INotificationService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendInApp(userId: string, title: string, message: string): Promise<void>;
}
