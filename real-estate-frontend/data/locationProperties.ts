/**
 * Location-based Property Data
 * Dummy data for location section with compact property cards
 * 
 * In production, this will be fetched from the API
 */

export interface LocationProperty {
  id: number;
  location: string;
  title: string;
  type: 'Residential' | 'Commercial';
  size: string;
  beds?: number;
  baths?: number;
  price?: string;
  image: string;
}

export const locationProperties: LocationProperty[] = [
  // Gulshan Properties
  {
    id: 1,
    location: 'Gulshan',
    title: '1154 SFT Commercial Space for Rent',
    type: 'Commercial',
    size: '1154 sq ft',
    beds: 0,
    baths: 1,
    price: 'BDT 65,000/month',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80',
  },
  {
    id: 2,
    location: 'Gulshan',
    title: '3-bedroom Luxury Apartment',
    type: 'Residential',
    size: '1850 sq ft',
    beds: 3,
    baths: 3,
    price: 'BDT 2.80 Crore',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80',
  },
  {
    id: 3,
    location: 'Gulshan',
    title: 'Modern Office Space in Gulshan 2',
    type: 'Commercial',
    size: '2200 sq ft',
    beds: 0,
    baths: 2,
    price: 'BDT 1.20 Lakh/month',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
  },
  {
    id: 4,
    location: 'Gulshan',
    title: '4-bedroom Penthouse with Rooftop',
    type: 'Residential',
    size: '3200 sq ft',
    beds: 4,
    baths: 4,
    price: 'BDT 4.50 Crore',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
  },

  // Dhanmondi Properties
  {
    id: 5,
    location: 'Dhanmondi',
    title: '2-bedroom Apartment near Lake',
    type: 'Residential',
    size: '1200 sq ft',
    beds: 2,
    baths: 2,
    price: 'BDT 1.45 Crore',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80',
  },
  {
    id: 6,
    location: 'Dhanmondi',
    title: 'Retail Shop Space in Dhanmondi 27',
    type: 'Commercial',
    size: '850 sq ft',
    beds: 0,
    baths: 1,
    price: 'BDT 45,000/month',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80',
  },
  {
    id: 7,
    location: 'Dhanmondi',
    title: 'Spacious 3-bedroom Family Home',
    type: 'Residential',
    size: '1650 sq ft',
    beds: 3,
    baths: 2,
    price: 'BDT 1.95 Crore',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
  },
  {
    id: 8,
    location: 'Dhanmondi',
    title: 'Studio Apartment for Young Professionals',
    type: 'Residential',
    size: '650 sq ft',
    beds: 1,
    baths: 1,
    price: 'BDT 28,000/month',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3c0e2?w=400&q=80',
  },

  // Bashundhara Properties
  {
    id: 9,
    location: 'Bashundhara',
    title: '5-bedroom Villa with Garden',
    type: 'Residential',
    size: '4200 sq ft',
    beds: 5,
    baths: 5,
    price: 'BDT 6.20 Crore',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80',
  },
  {
    id: 10,
    location: 'Bashundhara',
    title: 'Corporate Office Space',
    type: 'Commercial',
    size: '3500 sq ft',
    beds: 0,
    baths: 3,
    price: 'BDT 1.80 Lakh/month',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80',
  },
  {
    id: 11,
    location: 'Bashundhara',
    title: '3-bedroom Modern Apartment',
    type: 'Residential',
    size: '1750 sq ft',
    beds: 3,
    baths: 3,
    price: 'BDT 2.35 Crore',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80',
  },
  {
    id: 12,
    location: 'Bashundhara',
    title: 'Duplex Apartment with Terrace',
    type: 'Residential',
    size: '2800 sq ft',
    beds: 4,
    baths: 4,
    price: 'BDT 3.80 Crore',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80',
  },

  // Uttara Properties
  {
    id: 13,
    location: 'Uttara',
    title: '2-bedroom Apartment in Sector 7',
    type: 'Residential',
    size: '1100 sq ft',
    beds: 2,
    baths: 2,
    price: 'BDT 1.15 Crore',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80',
  },
  {
    id: 14,
    location: 'Uttara',
    title: 'Commercial Space near Airport',
    type: 'Commercial',
    size: '1800 sq ft',
    beds: 0,
    baths: 2,
    price: 'BDT 85,000/month',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80',
  },
  {
    id: 15,
    location: 'Uttara',
    title: '3-bedroom Family Apartment',
    type: 'Residential',
    size: '1450 sq ft',
    beds: 3,
    baths: 2,
    price: 'BDT 1.65 Crore',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&q=80',
  },
  {
    id: 16,
    location: 'Uttara',
    title: 'Furnished 2-bedroom for Rent',
    type: 'Residential',
    size: '1250 sq ft',
    beds: 2,
    baths: 2,
    price: 'BDT 38,000/month',
    image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=400&q=80',
  },

  // Mirpur Properties
  {
    id: 17,
    location: 'Mirpur',
    title: '3-bedroom Affordable Apartment',
    type: 'Residential',
    size: '1300 sq ft',
    beds: 3,
    baths: 2,
    price: 'BDT 95 Lakh',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&q=80',
  },
  {
    id: 18,
    location: 'Mirpur',
    title: 'Small Office Space in Mirpur 10',
    type: 'Commercial',
    size: '950 sq ft',
    beds: 0,
    baths: 1,
    price: 'BDT 35,000/month',
    image: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=400&q=80',
  },
  {
    id: 19,
    location: 'Mirpur',
    title: '2-bedroom Cozy Flat',
    type: 'Residential',
    size: '1050 sq ft',
    beds: 2,
    baths: 2,
    price: 'BDT 85 Lakh',
    image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&q=80',
  },
  {
    id: 20,
    location: 'Mirpur',
    title: '4-bedroom Spacious House',
    type: 'Residential',
    size: '2100 sq ft',
    beds: 4,
    baths: 3,
    price: 'BDT 1.45 Crore',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80',
  },
];
