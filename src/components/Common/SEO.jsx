import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://www.infrioindia.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const SITE_NAME = 'Infrio India';
const DEFAULT_HOME_TITLE = `${SITE_NAME} – Architecture, Design & Build Experts`;
const DEFAULT_DESCRIPTION =
  'Infrio India delivers premium architecture, interior design & building solutions. Our expert team blends creativity with functionality to create stunning residential, commercial and sustainable spaces that reflect your style and needs.';

/**
 * Per-page SEO: title, description, canonical, Open Graph, Twitter Card.
 * Use on every route for best Google ranking and sharing.
 * Falls back to index.html defaults when props are omitted.
 * @param {boolean} titleExact - If true, `title` is used as the full document title (no " | Site Name" suffix).
 */
function SEO({
  title,
  titleExact = false,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  noindex = false,
  type = 'website',
  keywords,
}) {
  const fullTitle =
    titleExact && title
      ? title
      : title
        ? `${title} | ${SITE_NAME}`
        : DEFAULT_HOME_TITLE;
  const canonical = canonicalPath ? `${SITE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}` : SITE_URL + '/';
  const ogImage = image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`;
  const alt = imageAlt || fullTitle;

  return (
    <Helmet>
      <title key="title">{fullTitle}</title>
      <meta key="description" name="description" content={description} />
      {keywords && <meta key="keywords" name="keywords" content={keywords} />}
      <link key="canonical" rel="canonical" href={canonical} />
      {noindex && <meta key="robots" name="robots" content="noindex, nofollow" />}

      <meta key="og:type" property="og:type" content={type} />
      <meta key="og:url" property="og:url" content={canonical} />
      <meta key="og:title" property="og:title" content={fullTitle} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:image" property="og:image" content={ogImage} />
      <meta key="og:image:alt" property="og:image:alt" content={alt} />
      <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
      <meta key="og:locale" property="og:locale" content="en_IN" />

      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={fullTitle} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={ogImage} />
      <meta key="twitter:image:alt" name="twitter:image:alt" content={alt} />
    </Helmet>
  );
}

export default SEO;
export { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, DEFAULT_HOME_TITLE };
