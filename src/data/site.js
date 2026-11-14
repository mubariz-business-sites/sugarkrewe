// Business info used across the site. Edit here, not in the pages.
export const SITE = {
  name: 'Sugar Krewe',
  url: 'https://sugarkrewe.com',
  tagline: 'Sweet Music. Sweet Life.',
  description:
    'Small-batch, New Orleans inspired gummies made in Metairie, LA. Six flavors, $6.99 a bag, free shipping over $35.',
  email: 'Sugarkrewe@gmail.com',
  city: 'Metairie',
  region: 'LA',
  postalCode: '70003',
  // Paste the full profile links here. Any left empty are hidden on the site.
  social: {
    instagram: '',
    facebook: '',
    tiktok: '',
  },
};

// Halal certificate. Put the file in public/halal/ (e.g. public/halal/certificate.pdf
// or certificate.jpg) and fill in the details. While `file` is empty the Halal
// page says the certificate is coming soon.
export const HALAL_CERT = {
  file: '', // e.g. '/halal/certificate.pdf'
  issuer: '', // certifying organization
  number: '', // certificate number
  expires: '', // e.g. 'December 31, 2027'
};

export const PRICE = 6.99; // per 4 oz bag. Must match functions/api/checkout.js
export const FREE_SHIP_MIN = 35;
export const SHIPPING = 5.99;
