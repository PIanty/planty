import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { SubmissionController } from '@controllers/submission.controller';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { SubmitDto } from '@dtos/submission.dto';

export class SubmissionRoute implements Routes {
  public path = '/';
  public router = Router();
  public submission = new SubmissionController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Public endpoints
    this.router.post(`${this.path}submitReceipt`, ValidationMiddleware(SubmitDto), this.submission.submitReceipt);
    this.router.get(`${this.path}submissionHistory/:address`, this.submission.getSubmissionHistory);
    this.router.get(`${this.path}passportStatus/:address`, this.submission.checkPassportStatus);
    this.router.get(`${this.path}passport/metadata/:tokenId`, this.submission.getPassportMetadata);
    
    // Admin endpoints
    this.router.post(`${this.path}mintPassport`, this.submission.mintPassport);
    this.router.post(`${this.path}triggerCycle`, this.submission.triggerCycle);
    this.router.post(`${this.path}setRewards`, this.submission.setRewards);
    this.router.post(`${this.path}withdrawRewards`, this.submission.withdrawRewards);
    this.router.post(`${this.path}setMaxSubmissions`, this.submission.setMaxSubmissions);
    this.router.post(`${this.path}setPassportRequired`, this.submission.setPassportRequired);
    
    // Stats endpoint
    this.router.get(`${this.path}contractStats`, this.submission.getContractStats);
    this.router.get(`${this.path}currentBlock`, this.submission.getCurrentBlock);
    this.router.get(`${this.path}totalPassports`, this.submission.getTotalPassports);
  }
}
