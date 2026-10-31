import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { inMemoryOrders } from './checkoutRoutes';
import { inMemoryProducts } from './productRoutes';
import { INITIAL_TESTIMONIALS } from '../data/initialData';

const router = Router();

interface ReviewItem {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// Initial seed reviews
let inMemoryReviews: ReviewItem[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userId: 'user-customer',
    userName: 'Sarah Khan',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    rating: 5,
    comment: "The sound cancellation is spectacular! Crisp highs and deep bass. Truly satisfied with the fast delivery.",
    isVerifiedPurchase: true,
    status: 'approved',
    createdAt: '2025-03-12',
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    userId: 'user-2',
    userName: 'Rafiul Islam',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    rating: 5,
    comment: 'Battery lasts all week with daily commute use. Premium build and comfortable padding.',
    isVerifiedPurchase: true,
    status: 'approved',
    createdAt: '2025-03-08',
  },
  {
    id: 'rev-3',
    productId: 'prod-2',
    userId: 'user-3',
    userName: 'Tonia Akter',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    rating: 5,
    comment: 'AMOLED screen is super bright in sunlight. Notifications and step counting are very accurate.',
    isVerifiedPurchase: true,
    status: 'approved',
    createdAt: '2025-03-05',
  },
];

// Get approved reviews for a product
router.get('/:productId', (req: Request, res: Response) => {
  const { productId } = req.params;
  const reviews = inMemoryReviews.filter((r) => r.productId === productId && r.status === 'approved');

  // Calculate histogram
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  reviews.forEach((r) => {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    sum += r.rating;
  });

  const average = reviews.length > 0 ? Math.round((sum / reviews.length) * 10) / 10 : 0;

  res.json({
    success: true,
    data: reviews,
    total: reviews.length,
    average,
    distribution,
  });
});

// Submit review (Authenticated customer only)
router.post('/', requireAuth, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      res.status(400).json({ success: false, error: 'Product ID, rating (1-5), and review comment are required' });
      return;
    }

    const ratingNum = Math.min(5, Math.max(1, parseInt(rating, 10)));

    // Prevent duplicate reviews
    const existing = inMemoryReviews.find((r) => r.productId === productId && r.userId === user.userId);
    if (existing) {
      res.status(400).json({ success: false, error: 'You have already submitted a review for this product.' });
      return;
    }

    // Verify purchase against authoritative order data
    const hasBought = inMemoryOrders.some(
      (o) => o.customerId === user.userId && o.items.some((i: any) => i.productId === productId)
    );

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      productId,
      userId: user.userId,
      userName: user.name,
      rating: ratingNum,
      comment: comment.trim(),
      isVerifiedPurchase: hasBought,
      status: 'approved', // auto-approved or pending based on policy
      createdAt: new Date().toISOString().split('T')[0],
    };

    inMemoryReviews.unshift(newReview);

    // Update product rating
    const prod = inMemoryProducts.find((p) => p.id === productId || p.slug === productId);
    if (prod) {
      const prodReviews = inMemoryReviews.filter((r) => r.productId === productId && r.status === 'approved');
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      prod.ratingAverage = Math.round(avg * 10) / 10;
      prod.reviewCount = prodReviews.length;
    }

    res.status(201).json({
      success: true,
      data: newReview,
      message: 'Thank you! Your review has been published.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Moderate reviews
router.get('/admin/list', requireAuth, requireRole(['admin', 'super_admin']), (req: Request, res: Response) => {
  res.json({ success: true, data: inMemoryReviews });
});

router.put('/admin/:id/moderate', requireAuth, requireRole(['admin', 'super_admin']), (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const rev = inMemoryReviews.find((r) => r.id === id);
  if (!rev) {
    res.status(404).json({ success: false, error: 'Review not found' });
    return;
  }

  rev.status = status;
  res.json({ success: true, message: `Review ${status}` });
});

router.delete('/admin/:id', requireAuth, requireRole(['admin', 'super_admin']), (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = inMemoryReviews.findIndex((r) => r.id === id);
  if (idx === -1) {
    res.status(404).json({ success: false, error: 'Review not found' });
    return;
  }
  inMemoryReviews.splice(idx, 1);
  res.json({ success: true, message: 'Review deleted' });
});

export default router;
