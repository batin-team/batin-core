import { Request, Response } from 'express';
import { BookingService } from '../services/booking';

export const createLock = async (req: Request, res: Response) => {
  try {
    const { providerId, startTime } = req.body;
    const lock = await BookingService.createLock(providerId, new Date(startTime));
    res.status(201).json(lock);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const confirmBooking = async (req: Request, res: Response) => {
  try {
    const { lockId } = req.body;
    const clientId = (req as any).user.id;
    const appointment = await BookingService.confirmBooking(lockId, clientId);
    res.status(200).json(appointment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user.id;
    const bookings = await BookingService.getClientBookings(clientId);
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
