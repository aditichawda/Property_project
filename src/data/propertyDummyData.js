import banner1 from "../images/banner/1.jpg";
import banner2 from "../images/banner/2.jpg";
import banner3 from "../images/banner/3.jpg";
import gallery1 from "../images/gallery/pic1.jpg";
import gallery2 from "../images/our-history/1.jpg";
import gallery3 from "../images/our-history/2.jpg";
import gallery4 from "../images/our-history/3.jpg";

export const PROPERTY_TYPES = [
  "Flats",
  "Houses",
  "Builder floors",
  "Plots",
  "Villas",
  "Commercial properties",
];
export const PROPERTY_PURPOSES = ["Buy", "Sale"];
export const PROPERTY_STATUSES = ["Active", "Deactive"];

export const PROPERTY_DUMMY_LIST = [
  {
    id: "prop-101",
    title: "Premium 3 BHK Family Apartment",
    location: "Vijay Nagar, Indore",
    city: "Indore",
    area: "Vijay Nagar",
    price: "₹72 Lac",
    priceValue: 7200000,
    type: "Flats",
   
    status: "Active",
    shortDescription:
      "Ready-to-move apartment with modular kitchen, covered parking, and city-facing balcony.",
    description:
      "A spacious 3 BHK apartment designed for families who want quick access to schools, malls, offices, and daily essentials. The property has strong natural light, a practical floor plan, and well-maintained common areas.",
    image: banner1,
    gallery: [banner1, gallery1, gallery2],
    amenities: ["Lift", "Security", "Power Backup", "Children Play Area"],
    specifications: {
      areaSize: "1450 sq.ft.",
      bedrooms: 3,
      bathrooms: 2,
      parking: "1 Covered",
    },
    seller: {
      name: "Raj Realty",
      mobile: "+91 90014 57000",
      email: "sales@infrioindia.com",
      company: "Infrio Property Marketplace",
    },
  },
  {
    id: "prop-102",
    title: "Corner Residential Plot",
    location: "Super Corridor, Indore",
    city: "Indore",
    area: "Super Corridor",
    price: "₹38 Lac",
    priceValue: 3800000,
    type: "Plots",
    status: "Active",
    shortDescription:
      "East-facing corner plot in a growing residential zone with clear approach road.",
    description:
      "A well-positioned plot suitable for independent house construction or long-term investment. The locality is developing quickly with good road connectivity and nearby residential projects.",
    image: banner2,
    gallery: [banner2, gallery3, gallery4],
    amenities: ["Corner Plot", "Wide Road", "Drainage", "Water Line"],
    specifications: {
      areaSize: "1200 sq.ft.",
      bedrooms: "N/A",
      bathrooms: "N/A",
      parking: "As per plan",
    },
    seller: {
      name: "Metro Land Bank",
      mobile: "+91 98765 43210",
      email: "plots@infrioindia.com",
      company: "Metro Land Bank",
    },
  },
  {
    id: "prop-103",
    title: "Commercial Shop Near Main Road",
    location: "MR 10, Indore",
    city: "Indore",
    area: "MR 10",
    price: "₹55 Lac",
    priceValue: 5500000,
    type: "Commercial properties",
   
    status: "Active",
    shortDescription:
      "Front-facing commercial unit suitable for retail, office, clinic, or service business.",
    description:
      "This compact commercial property offers strong visibility from the main road and a clean layout for multiple business use cases. Best suited for investors and owner-operated businesses.",
    image: banner3,
    gallery: [banner3, gallery1, gallery4],
    amenities: ["Main Road", "Visitor Parking", "Signage Space", "Washroom"],
    specifications: {
      areaSize: "520 sq.ft.",
      bedrooms: "N/A",
      bathrooms: 1,
      parking: "Common",
    },
    seller: {
      name: "Prime Commercials",
      mobile: "+91 99887 76655",
      email: "commercial@infrioindia.com",
      company: "Prime Commercials",
    },
  },
  {
    id: "prop-104",
    title: "Independent Duplex House",
    location: "Rau, Indore",
    city: "Indore",
    area: "Rau",
    price: "₹95 Lac",
    priceValue: 9500000,
    type: "Houses",
    status: "Active",
    shortDescription:
      "Modern duplex with private parking, terrace, and peaceful neighborhood setting.",
    description:
      "A complete independent house option for buyers looking for privacy, extra space, and future expansion potential. The duplex includes a large living area, family bedrooms, and open terrace.",
    image: banner3,
    gallery: [banner3, gallery1, gallery4],
    amenities: ["Private Terrace", "Modular Kitchen", "Parking", "Garden Space"],
    specifications: {
      areaSize: "2100 sq.ft.",
      bedrooms: 4,
      bathrooms: 3,
      parking: "2 Cars",
    },
    seller: {
      name: "Home Nest Realty",
      mobile: "+91 90987 65432",
      email: "homes@infrioindia.com",
      company: "Home Nest Realty",
    },
  },
];

export const ACTIVE_PROPERTIES = PROPERTY_DUMMY_LIST.filter(
  (property) => property.status === "Active",
);

export function readSellerAddedProperties() {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(localStorage.getItem("seller_properties_v1") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function readAllDemoProperties() {
  return [...readSellerAddedProperties(), ...PROPERTY_DUMMY_LIST];
}

export function readActiveDemoProperties() {
  return readAllDemoProperties().filter((property) => property.status === "Active");
}

export function saveSellerAddedProperty(property) {
  if (typeof window === "undefined") return property;
  const list = readSellerAddedProperties();
  const next = [property, ...list.filter((item) => String(item.id) !== String(property.id))];
  localStorage.setItem("seller_properties_v1", JSON.stringify(next));
  return property;
}

export function updateSellerAddedProperty(id, property) {
  if (typeof window === "undefined") return property;
  const list = readSellerAddedProperties();
  const next = list.map((item) => (String(item.id) === String(id) ? property : item));
  localStorage.setItem("seller_properties_v1", JSON.stringify(next));
  return property;
}

export function deleteSellerAddedProperty(id) {
  if (typeof window === "undefined") return;
  const list = readSellerAddedProperties();
  localStorage.setItem(
    "seller_properties_v1",
    JSON.stringify(list.filter((item) => String(item.id) !== String(id))),
  );
}

export function findPropertyById(id) {
  return readAllDemoProperties().find((property) => String(property.id) === String(id));
}
