import { Request, Response } from 'express';
import { CorporateService } from '../services/revenue_corporate';

export const submitInquiry = async (req: Request, res: Response) => {
  try {
    const { name, email, company, message } = req.body;
    if (!name || !email || !company || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const inquiry = await CorporateService.submitInquiry({ name, email, company, message });
    res.status(201).json(inquiry);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
