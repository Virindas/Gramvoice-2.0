import { Request, Response } from 'express';
import { Contact } from '../models/Contact';

export const contactController = {
  async getContacts(req: Request, res: Response) {
    try {
      const list = await Contact.find({});
      return res.status(200).json({ success: true, contacts: list });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async createContact(req: Request, res: Response) {
    const { name, role, phone, phoneNumber, office } = req.body;

    try {
      const contact = new Contact({
        name,
        role: role || 'Officer',
        phoneNumber: phoneNumber || phone || '',
        office: office || 'Panchayat Office'
      });

      await contact.save();

      return res.status(201).json({
        success: true,
        message: 'Contact added successfully to directory',
        contact
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateContact(req: Request, res: Response) {
    const { id } = req.params;
    const { name, role, phone, phoneNumber, office } = req.body;

    try {
      const contact = await Contact.findById(id);
      if (!contact) {
        return res.status(404).json({ success: false, message: 'Contact not found' });
      }

      if (name !== undefined) contact.name = name;
      if (role !== undefined) contact.role = role;
      if (phone !== undefined || phoneNumber !== undefined) contact.phoneNumber = phoneNumber || phone;
      if (office !== undefined) contact.office = office;

      await contact.save();

      return res.status(200).json({
        success: true,
        message: 'Contact updated successfully',
        contact
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteContact(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const result = await Contact.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Contact not found' });
      }
      return res.status(200).json({ success: true, message: 'Contact deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};
