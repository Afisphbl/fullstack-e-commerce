const fs = require("fs");
const path = require("path");

const PRODUCT_BASE_ID = "664200000000000000001";
const SPEC_BASE_ID = "664200000000000000002";
// Added more user IDs to avoid duplicate key error on reviews (product, user)
const USER_IDS = [
  "664200000000000000000013",
  "664200000000000000000014",
  "664200000000000000000015",
  "664200000000000000000016",
  "664200000000000000000017",
  "664200000000000000000018",
  "664200000000000000000019",
  "664200000000000000000020",
];
const CATEGORY_ID = "664200000000000000000001";

const electronicTypes = [
  {
    type: "Smartphone",
    brands: ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi"],
    specs: ["Processor", "RAM", "Storage", "Screen Size", "Battery"],
  },
  {
    type: "Laptop",
    brands: ["Dell", "HP", "Lenovo", "Apple", "Asus"],
    specs: ["CPU", "GPU", "RAM", "SSD", "Display"],
  },
  {
    type: "Tablet",
    brands: ["Apple", "Samsung", "Microsoft", "Lenovo", "Amazon"],
    specs: ["OS", "Storage", "Screen", "Connectivity", "Weight"],
  },
  {
    type: "Smartwatch",
    brands: ["Apple", "Samsung", "Garmin", "Fitbit", "Huawei"],
    specs: [
      "Compatibility",
      "Sensor",
      "Water Resistance",
      "Battery Life",
      "Display Type",
    ],
  },
  {
    type: "Headphones",
    brands: ["Sony", "Bose", "Sennheiser", "JBL", "Audio-Technica"],
    specs: ["Driver", "Frequency Response", "Wireless", "ANC", "Weight"],
  },
  {
    type: "Camera",
    brands: ["Canon", "Nikon", "Sony", "Fujifilm", "Panasonic"],
    specs: ["Sensor Type", "Resolution", "ISO Range", "Mount", "Video"],
  },
  {
    type: "Monitor",
    brands: ["LG", "Samsung", "Dell", "Acer", "BenQ"],
    specs: ["Resolution", "Refresh Rate", "Panel Type", "Brightness", "Ports"],
  },
  {
    type: "Keyboard",
    brands: ["Logitech", "Razer", "Corsair", "Keychron", "SteelSeries"],
    specs: [
      "Switch Type",
      "Layout",
      "Backlight",
      "Connectivity",
      "Programmable Keys",
    ],
  },
  {
    type: "Mouse",
    brands: ["Logitech", "Razer", "SteelSeries", "Glorious", "Zowie"],
    specs: ["DPI", "Sensor", "Weight", "Buttons", "Shape"],
  },
  {
    type: "Speaker",
    brands: ["Sonos", "JBL", "Marshall", "Sony", "Ultimate Ears"],
    specs: [
      "Output Power",
      "Connectivity",
      "Battery",
      "Waterproofing",
      "Range",
    ],
  },
];

const reviewTemplates = [
  "Absolutely amazing product! The {spec} is incredible.",
  "Very satisfied with my purchase. Best {type} I've ever owned.",
  "Decent quality for the price, but the {spec} could be better.",
  "A bit expensive, but definitely worth it for the {spec}.",
  "Fast delivery and the {type} works perfectly.",
  "The build quality is superb. Feels premium in hand.",
  "Highly recommend this to anyone looking for a reliable {type}.",
  "Great performance, though it gets a bit warm during use.",
  "The {spec} exceeded my expectations.",
  "Sleek design and very user-friendly.",
];

const products = [];
const specifications = [];
const reviews = [];

for (let i = 0; i < 50; i++) {
  const eType = electronicTypes[i % electronicTypes.length];
  const brand = eType.brands[Math.floor(Math.random() * eType.brands.length)];
  const modelNum = Math.floor(Math.random() * 900) + 100;
  const name = `${brand} ${eType.type} ${modelNum}`;

  const pId = `${PRODUCT_BASE_ID}${String(i + 100).padStart(3, "0")}`;
  const sId = `${SPEC_BASE_ID}${String(i + 100).padStart(3, "0")}`;

  products.push({
    _id: pId,
    name: name,
    description: `The latest ${name} offering top-tier performance and features in the ${eType.type} category. Ideal for professionals and enthusiasts alike.`,
    price: parseFloat((Math.random() * 1950 + 50).toFixed(2)),
    category: CATEGORY_ID,
    stock: Math.floor(Math.random() * 95) + 5,
    sold: Math.floor(Math.random() * 500),
    status: "active",
    imageCover: `product-electronic-${i + 1}.jpg`,
    images: [
      `product-electronic-${i + 1}-1.jpg`,
      `product-electronic-${i + 1}-2.jpg`,
    ],
    isFeatured: Math.random() > 0.5,
    ratingsAverage: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
    ratingsQuantity: 5,
    specification: sId,
  });

  const specsList = eType.specs.map((specName) => {
    let val = "Standard High-End";
    if (["Processor", "CPU"].includes(specName)) val = "Octa-core 3.2GHz";
    else if (["RAM"].includes(specName))
      val = `${[8, 16, 32][Math.floor(Math.random() * 3)]}GB DDR4`;
    else if (["Storage", "SSD"].includes(specName))
      val = `${[256, 512, 1024][Math.floor(Math.random() * 3)]}GB NVMe`;
    else if (["Screen Size", "Display", "Screen"].includes(specName))
      val = `${[6.1, 13.3, 15.6, 27, 32][Math.floor(Math.random() * 5)]} inch`;
    else if (["Battery", "Battery Life"].includes(specName))
      val = `${Math.floor(Math.random() * 40) + 10} hours`;

    return { name: specName, value: val };
  });

  specifications.push({
    _id: sId,
    product: pId,
    details: [{ group: "General", specs: specsList }],
  });

  // Shuffle users to ensure unique reviews per user for this product
  const shuffledUsers = [...USER_IDS].sort(() => 0.5 - Math.random());

  for (let j = 0; j < 5; j++) {
    const specName =
      eType.specs[Math.floor(Math.random() * eType.specs.length)];
    const reviewText = reviewTemplates[
      Math.floor(Math.random() * reviewTemplates.length)
    ]
      .replace("{type}", eType.type.toLowerCase())
      .replace("{spec}", specName.toLowerCase());

    reviews.push({
      review: reviewText,
      rating: Math.floor(Math.random() * 3) + 3,
      product: pId,
      user: shuffledUsers[j], // Each user will only review once per product
    });
  }
}

fs.writeFileSync(
  path.join(__dirname, "products_new.json"),
  JSON.stringify(products, null, 2),
);
fs.writeFileSync(
  path.join(__dirname, "specifications_new.json"),
  JSON.stringify(specifications, null, 2),
);
fs.writeFileSync(
  path.join(__dirname, "reviews_new.json"),
  JSON.stringify(reviews, null, 2),
);

console.log("Generated 50 products, 50 specifications, and 250 reviews.");
