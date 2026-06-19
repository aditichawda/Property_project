import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { SOLAR_BLOG_DUMMY } from "../../data/solarBlogDummy";
import {
  fetchSolarBlogList,
  parseSolarBlogListResponse,
} from "../../api/solarBlog";
import { getBlogId } from "../../utils/blogData";
import { stripHtml } from "../../utils/stripHtml";

const BLOG_FALLBACK_IMAGE = require("./../../images/blog/default/thum1.jpg");
const HOME_BLOG_COUNT = 3;
const PER_PAGE = 20;

/** Same blog API rules as /blog and Blog1: solar list if seller logged in, else auth list. */
export default function Blog3() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const raw = await fetchSolarBlogList({ page: 1, perPage: PER_PAGE });
        const { ok, items } = parseSolarBlogListResponse(raw, 1, PER_PAGE);
        const list = Array.isArray(items) ? items : [];
        if (!cancelled) setPosts(ok || list.length ? list : []);
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const display = posts.length > 0 ? posts.slice(0, HOME_BLOG_COUNT) : [];

  return (
    <>
      <div className="section-content">
        {loading && (
          <p className="text-center text-muted p-t20">Loading posts…</p>
        )}
        <div className="row justify-content-center">
          {!loading &&
            display.map((item, index) => {
              const blogId = getBlogId(item, index + 1);
              const detailLink = `/blog-detail/${blogId}`;
              const safeTitle = stripHtml(item?.title || "");
              const safeVendor = stripHtml(
                item?.vendorName || "Solar Insights",
              );
              const safeDesc = stripHtml(
                item?.short ||
                  item?.short_description ||
                  item?.description ||
                  "Explore practical insights and real updates from our solar team.",
              );
              return (
                <div
                  className="col-lg-4 col-md-6 col-sm-12"
                  key={item?.id ?? index}
                >
                  <NavLink
                    to={detailLink}
                    state={{ id: blogId, blog: item }}
                    className="blog-post blog-grid date-style-2 solar-blog-card solar-blog-card-link"
                  >
                    <div className="sx-post-media sx-img-effect img-reflection solar-blog-card__media">
                      <img
                        src={item?.banner || BLOG_FALLBACK_IMAGE}
                        alt={safeTitle || "Blog"}
                        onError={(e) => {
                          e.currentTarget.src = BLOG_FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <div className="sx-post-info solar-blog-card__body">
                      <div className="solar-blog-card__meta">
                        {safeVendor || "Solar Insights"}
                      </div>
                      <div className="sx-post-title ">
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
    </>
  );
}
