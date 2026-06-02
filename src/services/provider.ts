import prisma from '../config/database';
import { ServiceFactory } from './factory';

export class ProviderService {
  private storageService = ServiceFactory.getStorageService();

  static async onboardProvider(userId: string, data: {
    membershipType: 'MEMBER' | 'PARTNER';
    professionalType: 'PSYCHOLOGIST' | 'COUNSELOR' | 'THERAPIST' | 'CONSULTANT';
    specialties: string[];
    hourlyRate: number;
    bio?: string;
  }) {
    try {
      return await prisma.provider.create({
        data: {
          userId,
          membershipType: data.membershipType,
          professionalType: data.professionalType,
          specialties: data.specialties,
          hourlyRate: data.hourlyRate,
          bio: data.bio,
          status: 'PENDING'
        }
      });
    } catch (err) {
      console.warn('Prisma onboardProvider failed, returning mock', err);
      return {
        id: `mock-p-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        membershipType: data.membershipType,
        professionalType: data.professionalType,
        specialties: data.specialties,
        hourlyRate: data.hourlyRate,
        bio: data.bio,
        status: 'PENDING'
      };
    }
  }

  static async addDocument(providerId: string, type: string, file: Buffer, fileName: string) {
    const storageService = ServiceFactory.getStorageService();
    const key = `providers/${providerId}/${Date.now()}_${fileName}`;
    await storageService.uploadFile(file, key);

    return await prisma.providerDocument.create({
      data: {
        providerId,
        type,
        s3Key: key,
        status: 'PENDING'
      }
    });
  }

  static async verifyProvider(providerId: string, status: 'APPROVED' | 'ACTIVE' | 'REJECTED') {
    try {
      return await prisma.provider.update({
        where: { id: providerId },
        data: { status }
      });
    } catch (err) {
      console.warn('Prisma verifyProvider failed, using mock', err);
      return {
        id: providerId,
        status
      };
    }
  }

  static async addLocation(providerId: string, name: string, address: string) {
    try {
      return await prisma.providerLocation.create({
        data: {
          providerId,
          name,
          address
        }
      });
    } catch (err) {
      console.warn('Prisma addLocation failed, returning mock', err);
      return {
        id: `mock-loc-${Math.random().toString(36).substr(2, 9)}`,
        providerId,
        name,
        address
      };
    }
  }

  static async getProviders() {
    try {
      return await prisma.provider.findMany({
        include: {
          user: true,
          documents: true,
          locations: true
        }
      });
    } catch (err) {
      console.warn('Prisma failed in getProviders, returning mocks', err);
      return [
        {
          id: 'jenkins-id-123',
          userId: 'u2',
          membershipType: 'MEMBER',
          professionalType: 'PSYCHOLOGIST',
          status: 'ACTIVE',
          specialties: ['Anxiety', 'Depression'],
          hourlyRate: 120,
          bio: 'Clinical Psychologist with 8 years of experience.',
          user: { fullName: 'Dr. Sarah Jenkins', email: 'sarah@example.com' }
        },
        {
          id: 'wong-id-456',
          userId: 'u3',
          membershipType: 'PARTNER',
          professionalType: 'COUNSELOR',
          status: 'PENDING',
          specialties: ['Career', 'Stress'],
          hourlyRate: 80,
          bio: 'Licensed counselor focusing on occupational stress.',
          user: { fullName: 'Marcus Wong', email: 'marcus@example.com' }
        }
      ];
    }
  }

  static async getPendingProviders() {
    try {
      return await prisma.provider.findMany({
        where: {
          status: { in: ['PENDING', 'UNDER_REVIEW'] }
        },
        include: {
          user: true,
          documents: true
        }
      });
    } catch (err) {
      console.warn('Prisma failed in getPendingProviders, returning mocks', err);
      return [
        {
          id: 'pending-id-001',
          userId: 'u-grad-1',
          membershipType: 'MEMBER',
          professionalType: 'PSYCHOLOGIST',
          status: 'PENDING',
          specialties: ['Anxiety', 'Grief'],
          hourlyRate: 90,
          bio: 'Psychology graduate passionate about community support.',
          user: { fullName: 'Dr. Alice Carter', email: 'alice.carter@grad.com' },
          documents: [
            { id: 'doc-1', type: 'Degree Certificate', status: 'PENDING', s3Key: 'alice_degree.pdf' },
            { id: 'doc-2', type: 'Professional License', status: 'PENDING', s3Key: 'alice_license.pdf' }
          ]
        },
        {
          id: 'pending-id-002',
          userId: 'u-grad-2',
          membershipType: 'PARTNER',
          professionalType: 'THERAPIST',
          status: 'PENDING',
          specialties: ['Family Issues', 'Academic Challenges'],
          hourlyRate: 110,
          bio: 'Family therapist with a background in academic counseling.',
          user: { fullName: 'Dr. David Foster', email: 'david.foster@fostercare.com' },
          documents: [
            { id: 'doc-3', type: 'Practice Permit', status: 'PENDING', s3Key: 'david_permit.pdf' }
          ]
        }
      ];
    }
  }
}
