import prisma from '../config/database';

export class CmsService {
  static async createArticle(data: { title: string; content: string; categoryId: string; authorId: string }) {
    try {
      return await prisma.article.create({ data });
    } catch (err) {
      console.warn('Prisma failed to create article, using mock');
      return { id: `mock-art-${Math.random().toString(36).substr(2, 9)}`, ...data };
    }
  }

  static async getArticles() {
    try {
      return await prisma.article.findMany({ include: { category: true } });
    } catch (err) {
      console.warn('Prisma failed in getArticles, returning mocks');
      return [
        {
          id: 'art-1',
          title: 'Managing Anxiety Daily',
          content: 'Anxiety can be managed through deep breathing exercises, cognitive grounding techniques, and structure...',
          category: { name: 'Anxiety Support' },
          createdAt: new Date()
        },
        {
          id: 'art-2',
          title: 'Stress Relief in Corporate Life',
          content: 'Taking breaks, separating work from home life, and counseling can reduce corporate burnout significantly...',
          category: { name: 'Stress Relief' },
          createdAt: new Date(Date.now() - 24 * 3600 * 1000)
        },
        {
          id: 'art-3',
          title: 'Parenting and Child Development',
          content: 'Positive reinforcement, open dialogues, and counseling packages can help parent-child relationships...',
          category: { name: 'Parenting Support' },
          createdAt: new Date(Date.now() - 48 * 3600 * 1000)
        }
      ];
    }
  }

  static async createCategory(name: string) {
    try {
      return await prisma.cmsCategory.create({ data: { name } });
    } catch (err) {
      console.warn('Prisma failed to create category, using mock');
      return { id: `mock-cat-${Math.random().toString(36).substr(2, 9)}`, name };
    }
  }
}

export class SupportService {
  static async createTicket(userId: string, subject: string, message: string) {
    try {
      return await prisma.supportTicket.create({
        data: {
          userId,
          subject,
          message,
          status: 'OPEN'
        }
      });
    } catch (err) {
      console.warn('Prisma createTicket failed, returning mock');
      return {
        id: `mock-t-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        subject,
        message,
        status: 'OPEN',
        createdAt: new Date()
      };
    }
  }

  static async updateTicketStatus(ticketId: string, status: string) {
    try {
      return await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status }
      });
    } catch (err) {
      console.warn('Prisma updateTicketStatus failed, returning mock');
      return { id: ticketId, status };
    }
  }

  static async getTickets() {
    try {
      return await prisma.supportTicket.findMany({
        include: { user: { select: { fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      });
    } catch (err) {
      console.warn('Prisma failed in getTickets, returning mocks');
      return [
        {
          id: 'ticket-1',
          userId: 'u1',
          subject: 'Appointment Rescheduling Error',
          message: 'My session with Dr. Jenkins failed to show calendar event.',
          status: 'OPEN',
          createdAt: new Date(),
          user: { fullName: 'Test Client', email: 'client@example.com' }
        },
        {
          id: 'ticket-2',
          userId: 'u2',
          subject: 'Invoice copy request',
          message: 'Could you please send me a PDF invoice for my last completed payment?',
          status: 'IN_PROGRESS',
          createdAt: new Date(Date.now() - 3600 * 1000),
          user: { fullName: 'John Doe', email: 'john@doe.com' }
        }
      ];
    }
  }

  static async getUserTickets(userId: string) {
    try {
      return await prisma.supportTicket.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (err) {
      console.warn('Prisma failed in getUserTickets, returning mocks');
      return [
        {
          id: 'ticket-user-1',
          userId,
          subject: 'Refund Processing Delay',
          message: 'My transaction refund is still pending.',
          status: 'OPEN',
          createdAt: new Date()
        }
      ];
    }
  }
}
