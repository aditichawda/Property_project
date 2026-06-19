import { SOLAR_BLOG_DUMMY } from "../data/solarBlogDummy";

export const BLOG_FALLBACKS = SOLAR_BLOG_DUMMY;

export function getBlogId(item, fallbackId = "") {
  return (
    item?.id ??
    item?.blog_id ??
    item?.blogId ??
    item?.post_id ??
    item?._id ??
    fallbackId
  );
}

export function getBlogImage(item, fallbackImage) {
  return (
    item?.banner ||
    item?.image ||
    item?.thumbnail ||
    item?.thumbnail_url ||
    item?.blog_image ||
    item?.featured_image ||
    fallbackImage
  );
}

export function getBlogTitle(item) {
  return item?.title || item?.name || item?.blog_title || "";
}

export function getBlogVendor(item) {
  return (
    item?.vendorName ||
    item?.category_name ||
    item?.category ||
    item?.author_name ||
    item?.created_by ||
    "Property Guide"
  );
}

export function getBlogShort(item) {
  return (
    item?.short ||
    item?.short_description ||
    item?.summary ||
    item?.excerpt ||
    item?.description ||
    "Explore practical property marketplace tips."
  );
}

export function getBlogDescription(item) {
  return (
    item?.description ||
    item?.content ||
    item?.details ||
    item?.long_description ||
    getBlogShort(item)
  );
}
