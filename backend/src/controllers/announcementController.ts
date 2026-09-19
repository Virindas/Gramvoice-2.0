import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Announcement } from '../models/Announcement';

export const announcementController = {
  async getAnnouncements(req: Request, res: Response) {
    try {
      const list = await Announcement.find({}).sort({ createdAt: -1 });
      const mapped = list.map((item) => {
        const obj = item.toObject();
        const text = obj.content || obj.description || '';
        return {
          ...obj,
          content: text,
          description: text,
          body: text,
        };
      });
      return res.status(200).json({ success: true, announcements: mapped });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async createAnnouncement(req: Request, res: Response) {
    const { title, description, content, body, priority } = req.body;
    const detailText = content || description || body || '';

    try {
      const announcement = new Announcement({
        title,
        content: detailText,
        description: detailText,
        priority: priority || 'Medium'
      });

      await announcement.save();

      return res.status(201).json({
        success: true,
        message: 'Announcement published successfully',
        announcement: {
          ...announcement.toObject(),
          content: detailText,
          description: detailText,
          body: detailText,
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateAnnouncement(req: Request, res: Response) {
    const { id } = req.params;
    const { title, description, content, body, priority } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid announcement ID' });
    }

    try {
      const announcement = await Announcement.findById(id);
      if (!announcement) {
        return res.status(404).json({ success: false, message: 'Announcement not found' });
      }

      if (title !== undefined) announcement.title = title;
      const detailText = content || description || body;
      if (detailText !== undefined) {
        announcement.content = detailText;
        announcement.description = detailText;
      }
      if (priority !== undefined) announcement.priority = priority;

      await announcement.save();

      return res.status(200).json({
        success: true,
        message: 'Announcement updated successfully',
        announcement: {
          ...announcement.toObject(),
          content: announcement.content,
          description: announcement.description || announcement.content,
          body: announcement.content,
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteAnnouncement(req: Request, res: Response) {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid announcement ID' });
    }

    try {
      const result = await Announcement.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Announcement not found' });
      }
      return res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
