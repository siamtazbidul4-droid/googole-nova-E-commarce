import { Router, Request, Response } from 'express';
import { INITIAL_CATEGORIES } from '../data/initialData';
import { CategoryModel } from '../models/Category';
import { isDbConnected } from '../db';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
let inMemoryCategories = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));

// Get active categories
router.get('/', async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const cats = await CategoryModel.find({ isActive: true }).sort({ displayOrder: 1 });
      res.json({ success: true, data: cats });
      return;
    }

    res.json({ success: true, data: inMemoryCategories.filter((c: any) => c.isActive) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin create category
router.post('/', requireAuth, requireRole(['admin', 'super_admin', 'catalog_manager']), async (req: Request, res: Response) => {
  try {
    const { name, icon } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: 'Category name is required' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      slug,
      icon: icon || 'Tag',
      displayOrder: inMemoryCategories.length + 1,
      isActive: true,
    };

    inMemoryCategories.push(newCat);

    if (isDbConnected()) {
      await CategoryModel.create(newCat);
    }

    res.status(201).json({ success: true, data: newCat });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin update category
router.put('/:id', requireAuth, requireRole(['admin', 'super_admin', 'catalog_manager']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, icon, isActive, displayOrder } = req.body;
    const cat = inMemoryCategories.find((c: any) => c.id === id || c.slug === id);
    if (!cat) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }
    if (name !== undefined) cat.name = name.trim();
    if (icon !== undefined) cat.icon = icon;
    if (isActive !== undefined) cat.isActive = Boolean(isActive);
    if (displayOrder !== undefined) cat.displayOrder = Number(displayOrder);

    if (isDbConnected()) {
      await CategoryModel.findOneAndUpdate({ id }, cat);
    }
    res.json({ success: true, data: cat });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin delete category
router.delete('/:id', requireAuth, requireRole(['admin', 'super_admin', 'catalog_manager']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idx = inMemoryCategories.findIndex((c: any) => c.id === id || c.slug === id);
    if (idx === -1) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }
    inMemoryCategories.splice(idx, 1);
    if (isDbConnected()) {
      await CategoryModel.findOneAndDelete({ id });
    }
    res.json({ success: true, message: 'Category removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
