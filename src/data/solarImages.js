/**
 * Centralized, consistent solar/clean-energy imagery.
 * Uses royalty-free Unsplash CDN with size/quality params for fast loading.
 *
 * Notes:
 * - Use `w` based on placement (hero needs larger; cards smaller)
 * - Unsplash URLs are stable when pinned to photo IDs
 */

const u = (id, params) => `https://images.unsplash.com/${id}?auto=format&fit=crop&${params}`;

export const SOLAR_IMAGES = {
  // Large hero / slider (wide crops, bright tone)
  hero1: u('photo-1509395176047-4a66953fd231', 'w=1920&q=80'),
  hero2: u('photo-1508514177221-188b1cf16e9d', 'w=1920&q=80'),
  hero3: u('photo-1584277261846-c6a1672ed979', 'w=1920&q=80'),

  // Page banners
  defaultbanner: require('../images/solar/hero-1.jpg'),
  bannerDefault: require('../images/solar/3.jpg'),
  bannerSellers: require('../images/solar/3.jpg'),
  bannerSolutions: require('../images/solar/3.jpg'),

  // Section backgrounds
  ctaBg: u('photo-1497436072909-60f360e1d4b1', 'w=1920&q=78'),
  solutionsRightBg: u('photo-1509395176047-4a66953fd231', 'w=1400&q=76'),
};

