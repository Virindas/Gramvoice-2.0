import { Response } from 'express';
import { ServiceRequest } from '../models/ServiceRequest';
import { AuthRequest } from '../middleware/authMiddleware';
import { ObjectId } from 'mongodb';

export const serviceRequestController = {
  async getRequests(req: AuthRequest, res: Response) {
    try {
      const list = await ServiceRequest.find({}).populate('citizenId').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, requests: list });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async createRequest(req: AuthRequest, res: Response) {
    const { serviceType, service_type, type, details, description, status } = req.body;

    try {
      const userId = req.user?.id;
      const citizenId = userId && ObjectId.isValid(userId) ? new ObjectId(userId) : undefined;

      const request = new ServiceRequest({
        citizenId,
        serviceType: serviceType || service_type || type || 'General Service',
        details: details || description || '',
        status: status || 'Pending'
      });

      await request.save();

      return res.status(201).json({
        success: true,
        message: 'Service request created successfully',
        request
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateRequest(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { status, details, reply, adminNotes, adminReply } = req.body;

    try {
      const request = await ServiceRequest.findById(id);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Service request not found' });
      }

      if (status !== undefined) request.status = status;
      if (details !== undefined) request.details = details;
      if (reply || adminNotes || adminReply) (request as any).adminNotes = reply || adminNotes || adminReply;

      await request.save();

      return res.status(200).json({
        success: true,
        message: 'Service request updated successfully',
        request
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteRequest(req: AuthRequest, res: Response) {
    const { id } = req.params;
    try {
      const request = await ServiceRequest.findByIdAndDelete(id);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Service request not found' });
      }
      return res.status(200).json({ success: true, message: 'Service request deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
