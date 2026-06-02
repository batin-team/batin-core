import { IStorageService, ICalendarService, INotificationService } from './interfaces';
import { MockStorageService, MockCalendarService, MockNotificationService } from './mocks';

export class ServiceFactory {
  static getStorageService(): IStorageService {
    // For now, always return mock. In production, check ENV.
    return new MockStorageService();
  }

  static getCalendarService(): ICalendarService {
    return new MockCalendarService();
  }

  static getNotificationService(): INotificationService {
    return new MockNotificationService();
  }
}
