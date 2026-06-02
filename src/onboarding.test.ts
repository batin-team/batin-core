import { ProviderService } from '../src/services/provider';
import { CmsService, SupportService } from '../src/services/cms_support';
import prisma from '../src/config/database';

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    provider: {
      create: jest.fn(),
      update: jest.fn(),
    },
    providerDocument: {
      create: jest.fn(),
    },
    providerLocation: {
      create: jest.fn(),
    },
    article: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    cmsCategory: {
      create: jest.fn(),
    },
    supportTicket: {
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    }
  },
}));

describe('Phase 2: Provider, CMS & Support Tests', () => {
  it('should onboard a provider', async () => {
    const providerData = {
      membershipType: 'MEMBER' as const,
      professionalType: 'PSYCHOLOGIST' as const,
      specialties: ['Anxiety'],
      hourlyRate: 100
    };
    (prisma.provider.create as jest.Mock).mockResolvedValue({ id: 'p1', ...providerData });

    const provider = await ProviderService.onboardProvider('u1', providerData);
    expect(provider.id).toBe('p1');
    expect(prisma.provider.create).toHaveBeenCalled();
  });

  it('should verify a provider status transition', async () => {
    (prisma.provider.update as jest.Mock).mockResolvedValue({ id: 'p1', status: 'ACTIVE' });
    const provider = await ProviderService.verifyProvider('p1', 'ACTIVE');
    expect(provider.status).toBe('ACTIVE');
  });

  it('should create a CMS article', async () => {
    const articleData = { title: 'Test', content: 'Body', categoryId: 'c1', authorId: 'a1' };
    (prisma.article.create as jest.Mock).mockResolvedValue({ id: 'art1', ...articleData });

    const article = await CmsService.createArticle(articleData);
    expect(article.id).toBe('art1');
  });

  it('should create a support ticket', async () => {
    (prisma.supportTicket.create as jest.Mock).mockResolvedValue({ id: 't1', status: 'OPEN' });
    const ticket = await SupportService.createTicket('u1', 'Help', 'Msg');
    expect(ticket.status).toBe('OPEN');
  });
});
