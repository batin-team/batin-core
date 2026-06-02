import { Request, Response } from 'express';
import { SupportService } from '../services/cms_support';

export const createTicket = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }
    const ticket = await SupportService.createTicket(userId, subject, message);
    res.status(201).json(ticket);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    const ticket = await SupportService.updateTicketStatus(id as string, status as string);
    res.status(200).json(ticket);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await SupportService.getTickets();
    res.status(200).json(tickets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserTickets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const tickets = await SupportService.getUserTickets(userId);
    res.status(200).json(tickets);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
