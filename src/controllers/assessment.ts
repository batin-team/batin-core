import { Request, Response } from 'express';
import { AssessmentService } from '../services/assessment';

export const submitAssessment = async (req: Request, res: Response) => {
  try {
    const clientId = (req as any).user.id;
    const response = await AssessmentService.submitAssessment(clientId, req.body);
    res.status(201).json(response);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getResources = async (req: Request, res: Response) => {
  try {
    const resources = await AssessmentService.getCrisisResources(req.query.location as string);
    res.status(200).json(resources);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
