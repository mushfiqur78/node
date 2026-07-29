/**
 * Dummy Property Data
 * Sample data for property listings
 * 
 * In production, this will be fetched from the API
 */

export interface Property {
  id: number;
  type: 'buy' | 'rent';
  title: string;
  price: string;
  location: string;
  image: string;
  beds?: number;
  baths?: number;
  area?: number;
}

export const dummyProperties: Property[] = [
  // Buy Properties
  {
    id: 1,
    type: 'buy',
    title: '3-bedroom flat for sale in Banani',
    price: 'BDT 1.65 Crore',
    location: 'Banani',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    beds: 3,
    baths: 2,
    area: 1450,
  },
  {
    id: 2,
    type: 'buy',
    title: 'Luxury 5-bedroom villa in Gulshan',
    price: 'BDT 4.50 Crore',
    location: 'Gulshan',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    beds: 5,
    baths: 4,
    area: 3200,
  },
  {
    id: 3,
    type: 'buy',
    title: 'Modern 4-bedroom house in Dhanmondi',
    price: 'BDT 2.80 Crore',
    location: 'Dhanmondi',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    beds: 4,
    baths: 3,
    area: 2100,
  },
  {
    id: 4,
    type: 'buy',
    title: 'Spacious 6-bedroom penthouse in Bashundhara',
    price: 'BDT 5.20 Crore',
    location: 'Bashundhara',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    beds: 6,
    baths: 5,
    area: 4500,
  },
  {
    id: 5,
    type: 'buy',
    title: 'Elegant 3-bedroom apartment in Uttara',
    price: 'BDT 1.35 Crore',
    location: 'Uttara',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    beds: 3,
    baths: 2,
    area: 1350,
  },
  {
    id: 6,
    type: 'buy',
    title: 'Contemporary 2-bedroom flat in Mirpur',
    price: 'BDT 95 Lakh',
    location: 'Mirpur',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    beds: 2,
    baths: 2,
    area: 1100,
  },

  // Rent Properties
  {
    id: 7,
    type: 'rent',
    title: '2-bedroom apartment for rent in Banani',
    price: 'BDT 45,000/month',
    location: 'Banani',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    beds: 2,
    baths: 2,
    area: 1200,
  },
  {
    id: 8,
    type: 'rent',
    title: 'Furnished 3-bedroom flat for rent in Gulshan',
    price: 'BDT 75,000/month',
    location: 'Gulshan',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    beds: 3,
    baths: 2,
    area: 1600,
  },
  {
    id: 9,
    type: 'rent',
    title: 'Studio apartment for rent in Dhanmondi',
    price: 'BDT 25,000/month',
    location: 'Dhanmondi',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3c0e2?w=800&q=80',
    beds: 1,
    baths: 1,
    area: 650,
  },
  {
    id: 10,
    type: 'rent',
    title: '4-bedroom duplex for rent in Bashundhara',
    price: 'BDT 90,000/month',
    location: 'Bashundhara',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    beds: 4,
    baths: 3,
    area: 2400,
  },
  {
    id: 11,
    type: 'rent',
    title: 'Cozy 2-bedroom flat for rent in Uttara',
    price: 'BDT 35,000/month',
    location: 'Uttara',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    beds: 2,
    baths: 1,
    area: 950,
  },
  {
    id: 12,
    type: 'rent',
    title: 'Modern 3-bedroom apartment for rent in Mirpur',
    price: 'BDT 40,000/month',
    location: 'Mirpur',
    image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80',
    beds: 3,
    baths: 2,
    area: 1300,
  },
];
