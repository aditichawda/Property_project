export const SELLER_PACKAGE_STORAGE_KEY = "infrioSellerPackage";

export const sellerPackages = [
  {
    id: "free",
    name: "Free Listing",
    price: "Free",
    duration: "No payment required",
    badge: "Start free",
    postLimit: 2,
    listings: "2 property posts",
    enquiries: "Buyer enquiry dashboard included",
    features: [
      "Post 2 properties free",
      "Upload up to 10 images per property",
      "Receive buyer enquiries",
      "Manage listings from seller dashboard",
    ],
  },
  {
    id: "standard",
    name: "10 Property Pack",
    price: "₹499",
    duration: "1 year validity",
    badge: "Popular",
    postLimit: 10,
    listings: "10 property posts",
    enquiries: "Full enquiry management",
    features: [
      "Post up to 10 properties",
      "Upload up to 10 images per property",
      "Seller dashboard access",
      "Package valid for 1 year",
    ],
  },
  {
    id: "business",
    name: "25 Property Pack",
    price: "₹999",
    duration: "1 year validity",
    badge: "Best value",
    postLimit: 25,
    listings: "25 property posts",
    enquiries: "Full enquiry management",
    features: [
      "Post up to 25 properties",
      "Upload up to 10 images per property",
      "Seller dashboard access",
      "Package valid for 1 year",
    ],
  },
];

function parsePackageDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const raw = String(value).trim();
  const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const date = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function readSellerPackage() {
  if (typeof window === "undefined") return sellerPackages[0];
  try {
    const raw = window.localStorage.getItem(SELLER_PACKAGE_STORAGE_KEY);
    if (!raw) return sellerPackages[0];
    const saved = JSON.parse(raw);
    const matchedPackage = sellerPackages.find((pkg) => pkg.id === saved?.id);
    if (!matchedPackage && !saved?.id) return sellerPackages[0];
    const purchasedAt = saved.purchasedAt || "";
    const expiresAt =
      saved.expiresAt ||
      (purchasedAt
        ? new Date(
            new Date(purchasedAt).setFullYear(
              new Date(purchasedAt).getFullYear() + 1,
            ),
          ).toISOString()
        : "");
    return {
      ...(matchedPackage || saved),
      ...saved,
      purchasedAt,
      expiresAt,
    };
  } catch {
    return sellerPackages[0];
  }
}

export function hasActiveSellerPackage() {
  const pkg = readSellerPackage();
  if (pkg.id === "free") return false;
  const expiry = parsePackageDate(pkg.expiresAt);
  return Boolean(expiry && expiry.getTime() >= Date.now());
}

export function getSellerPostLimit() {
  const pkg = readSellerPackage();
  return pkg.isUnlimited ? Number.POSITIVE_INFINITY : pkg.postLimit || 2;
}

export function getSellerPackageUsage(totalProperties = 0) {
  const pkg = readSellerPackage();
  const total = Math.max(Number(totalProperties || 0), 0);
  const limit = Number(pkg.postLimit || 2);

  if (pkg.id === "free") {
    return {
      usedPosts: total,
      remainingPosts: Math.max(limit - total, 0),
      postLimit: limit,
    };
  }

  let baseline = Number(pkg.existingPropertyCount);
  if (!Number.isFinite(baseline)) {
    baseline = total;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        SELLER_PACKAGE_STORAGE_KEY,
        JSON.stringify({ ...pkg, existingPropertyCount: baseline }),
      );
    }
  }

  const usedPosts = Math.max(total - baseline, 0);
  if (pkg.isUnlimited) {
    return {
      usedPosts,
      remainingPosts: Number.POSITIVE_INFINITY,
      postLimit: Number.POSITIVE_INFINITY,
      isUnlimited: true,
    };
  }
  return {
    usedPosts,
    remainingPosts: Math.max(limit - usedPosts, 0),
    postLimit: limit,
    isUnlimited: false,
  };
}

export function saveSellerPackage(pkg, options = {}) {
  if (typeof window === "undefined" || !pkg?.id || pkg.id === "free") return;
  const apiDetails = pkg.purchaseDetails || {};
  const purchasedAt = new Date(
    apiDetails.purchase_date ||
      apiDetails.purchased_at ||
      apiDetails.created_at ||
      Date.now(),
  );
  const expiresAt = new Date(purchasedAt);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  window.localStorage.setItem(
    SELLER_PACKAGE_STORAGE_KEY,
    JSON.stringify({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration,
      postLimit: pkg.postLimit,
      isUnlimited:
        pkg.isUnlimited === true ||
        Number(pkg.is_unlimited || pkg.raw?.is_unlimited) === 1,
      purchasedAt: purchasedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      existingPropertyCount: Math.max(
        Number(options.existingPropertyCount || 0),
        0,
      ),
    }),
  );
}

export function syncSellerPackageFromApi(packageData, totalProperties = 0) {
  if (typeof window === "undefined" || !packageData) return null;

  const root = packageData?.data ?? packageData;
  const packageArrays = (keys) => {
    for (const key of keys) {
      const value = root?.[key];
      if (Array.isArray(value)) return value;
      if (Array.isArray(value?.data)) return value.data;
    }
    return null;
  };
  const activeKeys = [
    "active_package",
    "active_packages",
    "current_package",
    "current_packages",
    "package",
  ];
  const historyKeys = [
    "purchase_history",
    "package_history",
    "purchaseHistory",
    "packageHistory",
    "purchased_packages",
    "package_purchases",
    "package_purchase_history",
    "purchase_details",
    "purchases",
  ];
  const activeArray = packageArrays(activeKeys);
  const historyArray = packageArrays(historyKeys);
  const activeObject = activeKeys
    .map((key) => root?.[key])
    .find((value) => value && !Array.isArray(value) && typeof value === "object");

  if (
    Object.prototype.hasOwnProperty.call(root || {}, "package") &&
    (root.package === null ||
      root.package === false ||
      (Array.isArray(root.package) && root.package.length === 0))
  ) {
    window.localStorage.removeItem(SELLER_PACKAGE_STORAGE_KEY);
    return sellerPackages[0];
  }

  if (activeArray && activeArray.length === 0) {
    window.localStorage.removeItem(SELLER_PACKAGE_STORAGE_KEY);
    return sellerPackages[0];
  }

  if (
    (activeArray && activeArray.length === 0) &&
    (historyArray && historyArray.length === 0)
  ) {
    window.localStorage.removeItem(SELLER_PACKAGE_STORAGE_KEY);
    return sellerPackages[0];
  }

  const findPackage = (value, depth = 0) => {
    if (!value || typeof value !== "object" || depth > 5) return null;
    if (
      value.no_of_properties !== undefined ||
      value.is_unlimited !== undefined ||
      value.package_id !== undefined
    ) {
      return value;
    }
    const preferredKeys = [
      "active_package",
      "current_package",
      "package_details",
      "package_detail",
      "purchased_package",
      "package_purchase",
      "purchase",
      "subscription",
      "package",
    ];
    for (const key of preferredKeys) {
      const found = findPackage(value[key], depth + 1);
      if (found) return found;
    }
    for (const nested of Object.values(value)) {
      const found = findPackage(nested, depth + 1);
      if (found) return found;
    }
    return null;
  };

  const source =
    activeArray?.[0] ||
    activeObject ||
    findPackage(packageData);
  if (!source) {
    if (activeArray || historyArray) {
      window.localStorage.removeItem(SELLER_PACKAGE_STORAGE_KEY);
      return sellerPackages[0];
    }
    return null;
  }
  const id = source.package_id || source.id;
  if (!id) return null;

  const isUnlimited = Number(source.is_unlimited) === 1;
  const purchasedAt =
    source.purchase_date ||
    source.purchased_at ||
    source.valid_from ||
    source.start_date ||
    source.created_at ||
    new Date().toISOString();
  const expiresAt =
    source.expiry_date ||
    source.expires_at ||
    source.valid_till ||
    source.valid_to ||
    source.end_date ||
    "";
  const normalizedStatus = String(
    source.status_label ?? source.status ?? source.is_active ?? "",
  )
    .trim()
    .toLowerCase();
  const explicitlyInactive =
    normalizedStatus === "0" ||
    normalizedStatus === "inactive" ||
    normalizedStatus === "expired" ||
    normalizedStatus === "cancelled" ||
    normalizedStatus === "canceled";
  let resolvedExpiry = parsePackageDate(expiresAt);
  if (!resolvedExpiry && purchasedAt && Number(source.no_of_days) > 0) {
    resolvedExpiry = parsePackageDate(purchasedAt);
    if (resolvedExpiry) {
      resolvedExpiry = new Date(resolvedExpiry);
      resolvedExpiry.setDate(
        resolvedExpiry.getDate() + Number(source.no_of_days),
      );
    }
  }
  if (
    explicitlyInactive ||
    (resolvedExpiry && resolvedExpiry.getTime() < Date.now())
  ) {
    window.localStorage.removeItem(SELLER_PACKAGE_STORAGE_KEY);
    return sellerPackages[0];
  }
  const saved = readSellerPackage();
  const next = {
    id: String(id),
    name: source.title || source.package_name || source.name || saved.name,
    price: source.price || saved.price,
    duration: source.no_of_days
      ? `${source.no_of_days} days validity`
      : saved.duration,
    postLimit: isUnlimited
      ? 0
      : Number(source.no_of_properties ?? source.property_limit ?? saved.postLimit ?? 2),
    isUnlimited,
    purchasedAt,
    expiresAt: resolvedExpiry ? resolvedExpiry.toISOString() : "",
    existingPropertyCount: Number.isFinite(Number(saved.existingPropertyCount))
      ? Number(saved.existingPropertyCount)
      : Math.max(Number(totalProperties || 0), 0),
  };
  window.localStorage.setItem(
    SELLER_PACKAGE_STORAGE_KEY,
    JSON.stringify(next),
  );
  return next;
}

export function extractSellerPackageHistory(packageData) {
  const root = packageData?.data ?? packageData ?? {};
  const historyKeys = [
    "purchase_history",
    "package_history",
    "purchaseHistory",
    "packageHistory",
    "purchased_packages",
    "package_purchases",
    "package_purchase_history",
    "purchase_details",
    "purchases",
  ];
  let history = [];
  for (const key of historyKeys) {
    const value = root?.[key];
    if (Array.isArray(value)) {
      history = value;
      break;
    }
    if (Array.isArray(value?.data)) {
      history = value.data;
      break;
    }
  }

  const dateValue = (item, keys) =>
    keys.map((key) => item?.[key]).find((value) => value) || "";
  const timestamp = (item) => {
    const value = dateValue(item, [
      "expiry_date",
      "expires_at",
      "valid_till",
      "valid_to",
      "end_date",
      "valid_from",
      "purchase_date",
      "purchased_at",
      "start_date",
      "created_at",
    ]);
    const date = parsePackageDate(value);
    return date ? date.getTime() : Number(item?.id || 0);
  };

  return [...history]
    .sort((a, b) => timestamp(b) - timestamp(a))
    .slice(0, 3)
    .map((item, index) => {
      const packageInfo =
        item?.package && typeof item.package === "object" ? item.package : {};
      const startDate = dateValue(item, [
        "purchase_date",
        "purchased_at",
        "valid_from",
        "start_date",
        "created_at",
      ]);
      const expiryDate = dateValue(item, [
        "expiry_date",
        "expires_at",
        "valid_till",
        "valid_to",
        "end_date",
      ]);
      const expiry = parsePackageDate(expiryDate);
      const expired = Boolean(expiry && expiry.getTime() < Date.now());
      const apiStatus = String(item?.status_label || item?.status || "")
        .trim()
        .toLowerCase();
      return {
        id: item?.id || item?.package_id || `package-history-${index}`,
        name:
          item?.title ||
          item?.package_title ||
          item?.package_name ||
          item?.name ||
          packageInfo?.title ||
          packageInfo?.name ||
          "Seller Package",
        price: item?.price ?? packageInfo?.price ?? "-",
        paymentMethod:
          item?.payment_method ||
          item?.paymentMethod ||
          item?.payment_mode ||
          item?.paymentMode ||
          item?.method ||
          "-",
        startDate,
        expiryDate,
        status:
          expired || apiStatus === "expired" || apiStatus === "inactive"
            ? "Expired"
            : "Purchased",
      };
    });
}
