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
    instagram: 'https://www.instagram.com/sugarkrewegummies/',
    facebook: '',
    tiktok: '',
  },
};

// Halal certificates shown on /halal. Put files in public/halal/.
// `image` is shown on the page, `file` is the full PDF to open/download.
export const HALAL_CERTS = [
  {
    label: "Our ingredient supplier's Halal certificate",
    holder: 'Kervan Gıda Sanayi ve Ticaret A.Ş. (Akhisar, Türkiye)',
    issuer: 'Turkish Standards Institution (TSE)',
    number: '008002-HG-02/08',
    covers: 'Soft candy and chewing gum (Bebeto brand)',
    expires: 'September 10, 2027',
    image: '/halal/kervan-tse-halal-certificate.jpg',
  },
];

export const PRICE = 6.99; // per 4 oz bag. Must match functions/api/checkout.js
export const FREE_SHIP_MIN = 35;
export const SHIPPING = 5.99;
