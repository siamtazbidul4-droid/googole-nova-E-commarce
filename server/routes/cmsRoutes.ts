import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { INITIAL_TESTIMONIALS } from '../data/initialData';

const router = Router();

let inMemoryCMS = {
  announcementBar: {
    enabled: true,
    freeShippingText: 'Free shipping on orders over ৳5,000 / $50',
    guaranteeText: '30 Days Money Back Guarantee',
    supportText: '24/7 Customer Support in Bangladesh',
  },
  heroBanner: {
    tag: 'NEW ARRIVALS',
    headline: 'Upgrade Your\nLifestyle',
    subheadline: 'Discover premium quality products designed for a better, smarter and easier life.',
    buttonText: 'Shop Now',
    buttonLink: '/shop',
    modelScript: 'Good Things\nTake Time ♡',
    lifestyleImage: '/assets/aistudio/ShopMax_Premium_E-Commerce_Homepage_4a6173dd.png',
  },
  splitCampaigns: {
    card1: {
      tag: 'Smart Tech',
      headline: 'Smart Tech\nSmarter You',
      subheadline: 'Latest gadgets. Unbeatable prices.',
      buttonText: 'Shop Now',
      buttonLink: '/shop?category=electronics',
      theme: 'dark',
    },
    card2: {
      tag: 'Fashion',
      headline: 'Fashion\nThat Speaks You',
      subheadline: 'Trendy styles for every mood.',
      buttonText: 'Shop Now',
      buttonLink: '/shop?category=fashion',
      theme: 'peach',
    },
  },
  promotionalAds: {
    enabled: true,
    tag: 'LIMITED TIME OFFER',
    headline: 'UP TO 50% OFF',
    subheadline: 'On Your Favorite Brands',
    buttonText: 'Shop Now',
    buttonLink: '/shop?discount=true',
    imageUrl: '',
    backgroundColor: '#0c261e',
  },
  testimonials: INITIAL_TESTIMONIALS,
};

let inMemoryNewsletter: string[] = ['subscriber1@novara.com'];
let inMemoryEnquiries: any[] = [];

// Get homepage CMS content
router.get('/homepage', (req: Request, res: Response) => {
  res.json({ success: true, data: inMemoryCMS });
});

// Update homepage CMS (Admin)
router.put('/homepage', requireAuth, requireRole(['admin', 'super_admin', 'catalog_manager']), (req: Request, res: Response) => {
  inMemoryCMS = {
    ...inMemoryCMS,
    ...req.body,
  };
  res.json({ success: true, data: inMemoryCMS, message: 'CMS settings saved successfully' });
});

// Newsletter subscription
router.post('/newsletter', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    res.status(400).json({ success: false, error: 'Please enter a valid email address' });
    return;
  }

  const normalized = email.toLowerCase().trim();
  if (inMemoryNewsletter.includes(normalized)) {
    res.json({ success: true, message: 'You are already subscribed to our newsletter!' });
    return;
  }

  inMemoryNewsletter.push(normalized);
  res.status(201).json({
    success: true,
    message: 'Welcome to the NOVARA club! You have been subscribed for exclusive deals.',
  });
});

// Customer Support Enquiry
router.post('/support-enquiry', (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ success: false, error: 'Name, email, and message are required' });
    return;
  }

  const enquiry = {
    id: `enq-${Date.now()}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    subject: subject?.trim() || 'General Inquiry',
    message: message.trim(),
    status: 'open',
    createdAt: new Date(),
  };

  inMemoryEnquiries.push(enquiry);
  res.status(201).json({
    success: true,
    message: 'Thank you for reaching out! Our Dhaka support desk will contact you shortly.',
  });
});

export default router;
