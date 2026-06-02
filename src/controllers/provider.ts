import { Request, Response } from 'express';
import { ProviderService } from '../services/provider';

export const onboardProvider = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const provider = await ProviderService.onboardProvider(userId, req.body);
    res.status(201).json(provider);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addLocation = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    const location = await ProviderService.addLocation(providerId as string, req.body.name, req.body.address);
    res.status(201).json(location);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyProvider = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    const provider = await ProviderService.verifyProvider(providerId as string, req.body.status);
    res.status(200).json(provider);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProviders = async (req: Request, res: Response) => {
  try {
    const list = await ProviderService.getProviders();
    res.status(200).json(list);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingProviders = async (req: Request, res: Response) => {
  try {
    const list = await ProviderService.getPendingProviders();
    res.status(200).json(list);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
