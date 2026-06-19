const u = (id, params) => `https://images.unsplash.com/${id}?auto=format&fit=crop&${params}`;

export const PROPERTY_IMAGES = {
  hero1: require('../images/property/1.jpg'),
  hero2: require('../images/property/2.jpg'),
  hero3: require('../images/property/3.jpg'),

  defaultbanner: require('../images/property/1.jpg'), // ← hero-1.jpg nahi hai to 1.jpg
  bannerDefault: require('../images/property/4.jpg'),
  bannerSellers: require('../images/property/2.jpg'),
  bannerSolutions: require('../images/property/3.jpg'),
  bannerProperty: require('../images/property/5.jpg'),
  ctaBg1: require('../images/property/8.jpg'),
  solutionsRightBg1: require('../images/property/8.jpg'),
  ctaBg: u('photo-1497436072909-60f360e1d4b1', 'w=1920&q=78'),
  solutionsRightBg: u('photo-1509395176047-4a66953fd231', 'w=1400&q=76'),
};