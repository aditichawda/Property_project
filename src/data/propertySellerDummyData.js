import seller1 from "../images/property/1.jpg";
import seller2 from "../images/property/2.jpg";
import seller3 from "../images/property/3.jpg";
import seller4 from "../images/property/4.jpg";
import seller5 from "../images/property/5.jpg";
import seller6 from "../images/property/6.jpg";
import { readAllDemoProperties } from "./propertyDummyData";

export const PROPERTY_SELLERS = [
  {
    id: "seller-101",
    name: "Sharma Properties",
    company: "Sharma Realty Group",
    state: "Madhya Pradesh",
    city: "Indore",
    area: "Vijay Nagar",
    phone: "+91 98765 43210",
    email: "sharma@infrioindia.com",
    totalProperties: 14,
    image: seller1,
    description:
      "Premium flats, family homes, and ready-to-move apartments in prime locations.",
    propertyIds: ["prop-101"],
  },
  {
    id: "seller-102",
    name: "Patel Land Developers",
    company: "Patel Land Developers",
    state: "Madhya Pradesh",
    city: "Bhopal",
    area: "Kolar Road",
    phone: "+91 99887 76655",
    email: "patel@infrioindia.com",
    totalProperties: 9,
    image: seller2,
    description:
      "Residential plots, township projects, and investment land parcels.",
    propertyIds: ["prop-102"],
  },
  {
    id: "seller-103",
    name: "Gupta Commercial Hub",
    company: "Gupta Commercial Hub",
    state: "Maharashtra",
    city: "Pune",
    area: "Hinjewadi",
    phone: "+91 90909 80808",
    email: "gupta@infrioindia.com",
    totalProperties: 7,
    image: seller3,
    description:
      "Commercial offices, retail shops, and business spaces in high-demand areas.",
    propertyIds: ["prop-103"],
  },
  {
    id: "seller-104",
    name: "Royal Homes Realty",
    company: "Royal Homes Realty",
    state: "Gujarat",
    city: "Ahmedabad",
    area: "Satellite",
    phone: "+91 91234 56789",
    email: "royalhomes@infrioindia.com",
    totalProperties: 11,
    image: seller4,
    description:
      "Luxury villas, duplex houses, and premium residential apartments.",
    propertyIds: ["prop-104"],
  },
  {
    id: "seller-105",
    name: "Dream Nest Properties",
    company: "Dream Nest Properties",
    state: "Rajasthan",
    city: "Jaipur",
    area: "Malviya Nagar",
    phone: "+91 90123 45678",
    email: "dreamnest@infrioindia.com",
    totalProperties: 13,
    image: seller5,
    description:
      "Affordable apartments, resale properties, and gated community homes.",
    propertyIds: ["prop-105"],
  },
  {
    id: "seller-106",
    name: "Elite Infra Estate",
    company: "Elite Infra Estate",
    state: "Delhi",
    city: "New Delhi",
    area: "Dwarka",
    phone: "+91 98989 78787",
    email: "eliteinfra@infrioindia.com",
    totalProperties: 15,
    image: seller6,
    description:
      "Modern apartments, commercial complexes, and investment properties.",
    propertyIds: ["prop-106"],
  },
];

export function findPropertySellerById(id) {
  return PROPERTY_SELLERS.find((seller) => String(seller.id) === String(id));
}

export function getPropertiesForSeller(sellerId) {
  const seller = findPropertySellerById(sellerId);
  if (!seller) return [];
  const ids = new Set((seller.propertyIds || []).map(String));
  return readAllDemoProperties().filter((property) => {
    if (ids.has(String(property.id))) return true;
    const propertySellerName = property.seller?.name || "";
    const propertySellerCompany = property.seller?.company || "";
    return (
      propertySellerName === seller.name ||
      propertySellerName === seller.company ||
      propertySellerCompany === seller.company
    );
  });
}
