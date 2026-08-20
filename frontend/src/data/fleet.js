// Curated fleet catalogue for the "Our Fleet" section on HomePage.
// - image: full Cloudinary URL (must be a real, uploaded asset)
// - brochureUrl: served from public/brochures/. Filenames may contain
//   spaces, parentheses, or double dots — PdfBrochureModal wraps this
//   value with encodeURI() before passing to the iframe src.
// To migrate PDFs to Cloudinary later, just swap the brochureUrl string;
// no code change needed elsewhere.

export const fleet = [
  {
    id: "bmw-7-series",
    name: "BMW 7 Series",
    rating: 4.9,
    reviews: 187,
    pricePerDay: 12000,
    image: "https://res.cloudinary.com/hioiaexf/image/upload/v1785396321/b5a61b13-cbc2-4ece-bac2-bff1f286781c.png",
    brochureUrl: "/brochures/ebbfb29a291140bfa5bd81c5798e7bf2.pdf",
  },
  {
    id: "mercedes-e-class",
    name: "Mercedes-Benz S-Class",
    rating: 4.8,
    reviews: 142,
    pricePerDay: 9500,
    image: "https://res.cloudinary.com/hioiaexf/image/upload/v1785396407/159afaa0-01f7-4780-91e6-5189f702a557.png",
    brochureUrl: "/brochures/TN 01 BP 9084.pdf",
  },
  {
    id: "toyota-fortuner",
    name: "TOYOTA CAMRY",
    rating: 4.8,
    reviews: 312,
    pricePerDay: 6500,
    image: "https://res.cloudinary.com/hioiaexf/image/upload/v1785394923/46b7e51a-e232-4f45-acb5-d6852be21014.png",
    brochureUrl: "/brochures/KA 03 NM 7857(1).pdf",
  },
  {
    id: "toyota-innova-crysta",
    name: "Toyota VELFIRE",
    rating: 4.7,
    reviews: 428,
    pricePerDay: 3800,
    image: "https://res.cloudinary.com/hioiaexf/image/upload/v1785396188/892a60ef-a9ab-4d0a-8971-80b341cdcfab.png",
    brochureUrl: "/brochures/KA 01 AT 9393.pdf",
  },
  {
    id: "force-urbania",
    name: "BMW 520 D",
    rating: 4.8,
    reviews: 256,
    pricePerDay: 7500,
    image: "https://res.cloudinary.com/hioiaexf/image/upload/v1785396014/030074ca-b62a-4bbd-b5e7-ca8155ac51d9.png",
    brochureUrl: "/brochures/DD 01 AE 9393.pdf",
  },
  {
    id: "tempo-traveller",
    name: "Mercedes-Benz S-Class",
    rating: 4.6,
    reviews: 384,
    pricePerDay: 4500,
    image: "https://res.cloudinary.com/hioiaexf/image/upload/v1785396231/afe1bc6b-95f7-419d-9b9d-68ef2a3db0a8.png",
    brochureUrl: "/brochures/DD 01 Z 9699.pdf",
  },
  {
    id: "kia-carnival",
    name: "Kia Carnival",
    rating: 4.7,
    reviews: 168,
    pricePerDay: 8000,
    image: "https://res.cloudinary.com/hioiaexf/image/upload/v1785396074/8fb1b73c-abea-40f3-9ddd-c32f24b693ee.png",
    brochureUrl: "/brochures/DOC-20260608-WA0039..pdf",
  },
  {
    id: "toyota-camry",
    name: "AUDI A6",
    rating: 4.7,
    reviews: 203,
    pricePerDay: 5500,
    image: "https://res.cloudinary.com/hioiaexf/image/upload/v1785396149/b31effbc-fdd9-4788-854f-df5b5d8b9d69.png",
    brochureUrl: "/brochures/DOC-20260611-WA0072..pdf",
  },
  // {
  //   id: "toyota-etios",
  //   name: "Toyota Etios",
  //   rating: 4.5,
  //   reviews: 512,
  //   pricePerDay: 2200,
  //   image: "https://res.cloudinary.com/hioiaexf/image/upload/v1785396279/567906db-22a0-4191-a5dc-f3d5dcb489ec.png",
  //   brochureUrl: "/brochures/DOC-20260422-WA0016..pdf",
  // },
  // {
  //   id: "maruti-suzuki-dzire",
  //   name: "Maruti Suzuki Dzire",
  //   rating: 4.6,
  //   reviews: 634,
  //   pricePerDay: 2000,
  //   image: "https://res.cloudinary.com/hioiaexf/image/upload/v1785396579/f413f3c8-5a03-42e6-8b22-a4d0a7b221db.png",
  //   brochureUrl: "/brochures/DOC-20260521-WA0050..pdf",
  // },
];
