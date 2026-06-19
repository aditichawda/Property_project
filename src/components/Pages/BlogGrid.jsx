import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Header2 from "./../Common/Header2";
import SEO from "./../Common/SEO";
import Banner from "./../Elements/Banner";
import Footer2 from "../Common/Footer2";
import { stripHtml } from "../../utils/stripHtml";
import {
  fetchSolarBlogList,
  parseSolarBlogListResponse,
} from "../../api/solarBlog";
import {
  BLOG_FALLBACKS,
  getBlogId,
  getBlogImage,
  getBlogShort,
  getBlogTitle,
  getBlogVendor,
} from "../../utils/blogData";

const bnrimg = require("./../../images/property/5.jpg");
const BLOG_FALLBACK_IMAGE = require("./../../images/blog/default/thum1.jpg");
const BLOG_CACHE_KEY = "property_blog_list_cache_v1";

function readCachedBlogs() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(sessionStorage.getItem(BLOG_CACHE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function cacheBlogs(items) {
  if (typeof window === "undefined" || !Array.isArray(items)) return;
  sessionStorage.setItem(BLOG_CACHE_KEY, JSON.stringify(items));
}

function BlogGrid() {
  const [blogs, setBlogs] = useState(readCachedBlogs);
  const [loading, setLoading] = useState(() => readCachedBlogs().length === 0);

  useEffect(() => {
    let alive = true;
    async function loadBlogs() {
      try {
        setLoading(true);
        const raw = await fetchSolarBlogList({ page: 1, perPage: 30 });
        const { ok, items } = parseSolarBlogListResponse(raw, 1, 30);
        if (!alive) return;
        if (ok && items.length) {
          setBlogs(items);
          cacheBlogs(items);
        } else {
          setBlogs((prev) => (prev.length ? prev : BLOG_FALLBACKS));
        }
      } catch (error) {
        console.error(error);
        if (alive) setBlogs((prev) => (prev.length ? prev : BLOG_FALLBACKS));
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadBlogs();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <SEO
        titleExact
        title="Property Blog - Real Estate Buyer and Seller Tips"
        description="Read practical property marketplace tips for buyers and sellers, including listings, enquiries, filters, property visits, and seller lead generation."
        keywords="property blog, real estate tips, property buyer guide, seller property listing tips, property enquiry marketplace"
        canonicalPath="/blog"
      />
      <Header2 />
      <div className="page-content">
        <Banner
          title="Blogs"
          pagename="Blogs"
          description="Property buying, selling, listing, and enquiry tips."
          bgimage={bnrimg}
        />

        <div className="section-full p-tb30 bg-white inner-page-padding">
          <div className="container">
            <div className="row clearfix">
              {loading ? (
                <div className="col-12">
                  <p className="text-center p-a30 bg-gray radius-md">
                    
                  </p>
                </div>
              ) : null}
              {blogs.map((item, index) => {
                const blogId = getBlogId(item, index + 1);
                const detailLink = `/blog-detail/${blogId}`;
                const safeTitle = stripHtml(getBlogTitle(item));
                const safeVendor = stripHtml(getBlogVendor(item));
                const safeDesc = stripHtml(getBlogShort(item));
                const image = getBlogImage(item, BLOG_FALLBACK_IMAGE);

                return (
                  <div
                    className="col-lg-4 col-md-6 col-sm-12 m-b30"
                    key={item?.id ?? index}
                  >
                    <NavLink
                      to={detailLink}
                      state={{ id: blogId, blog: item }}
                      className="blog-grid date-style-2 h-100 solar-blog-card solar-blog-card-link"
                    >
                      <div className="sx-post-media sx-img-effect img-reflection solar-blog-card__media">
                        <img
                          src={image}
                          alt={safeTitle || "Blog"}
                          title={safeTitle || "Blog"}
                          onError={(e) => {
                            e.currentTarget.src = BLOG_FALLBACK_IMAGE;
                          }}
                        />
                      </div>
                      <div className="sx-post-info solar-blog-card__body">
                        <div className="solar-blog-card__meta">
                          {safeVendor || "Property Guide"}
                        </div>
                        <div className="sx-post-title">
                          <h4 className="post-title solar-blog-card__title">
                            {safeTitle}
                          </h4>
                        </div>
                        <p className="solar-blog-card__desc">{safeDesc}</p>

                        <div className="sx-post-readmore">
                          <span className="site-button-link solar-blog-card__readmore">
                            View More
                          </span>
                        </div>
                      </div>
                    </NavLink>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Footer2 />
    </>
  );
}

export default BlogGrid;
