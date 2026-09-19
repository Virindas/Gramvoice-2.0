import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { VillageInfo } from '../models/VillageInfo';

export const villageInfoController = {
  async getRules(req: Request, res: Response) {
    try {
      const list = await VillageInfo.find({});
      return res.status(200).json({ success: true, rules: list });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async createRule(req: Request, res: Response) {
    const { title, category, content, penalty, effectiveDate } = req.body;

    try {
      const rule = new VillageInfo({
        title,
        category,
        content,
        penalty,
        effectiveDate
      });

      await rule.save();

      return res.status(201).json({
        success: true,
        message: 'Village rule added successfully',
        rule
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateRule(req: Request, res: Response) {
    const { id } = req.params;
    const { title, category, content, penalty, effectiveDate } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid rule ID' });
    }

    try {
      const rule = await VillageInfo.findById(id);
      if (!rule) {
        return res.status(404).json({ success: false, message: 'Village rule not found' });
      }

      if (title !== undefined) rule.title = title;
      if (category !== undefined) rule.category = category;
      if (content !== undefined) rule.content = content;
      if (penalty !== undefined) rule.penalty = penalty;
      if (effectiveDate !== undefined) rule.effectiveDate = effectiveDate;

      await rule.save();

      return res.status(200).json({
        success: true,
        message: 'Village rule updated successfully',
        rule
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteRule(req: Request, res: Response) {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid rule ID' });
    }

    try {
      const result = await VillageInfo.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Village rule not found' });
      }
      return res.status(200).json({ success: true, message: 'Village rule deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
