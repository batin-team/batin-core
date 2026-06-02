import { Request, Response } from 'express';
import { ReviewService } from '../services/review';

export const submitReview = async (req: Request, res: Response) => {
  try {
    const { appointmentId, rating, comment, isAnonymous } = req.body;
    if (!appointmentId || !rating) {
      return res.status(400).json({ message: 'Appointment ID and rating are required' });
    }
    const review = await ReviewService.submitReview(appointmentId, Number(rating), comment, !!isAnonymous);
    res.status(201).json(review);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
