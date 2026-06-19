import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
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

const bgimg1 = require("./../../images/background/cross-line2.png");
const BLOG_FALLBACK_IMAGE = require("./../../images/blog/default/thum1.jpg");
const HOME_BLOG_COUNT = 3;

export default function Blog1() {
  const [blogs, setBlogs] = useState(BLOG_FALLBACKS.slice(0, HOME_BLOG_COUNT));

  useEffect(() => {
    let alive = true;
    async function loadBlogs() {
      try {
        const raw = await fetchSolarBlogList({
          page: 1,
          perPage: HOME_BLOG_COUNT,
        });
        const { ok, items } = parseSolarBlogListResponse(
          raw,
          1,
          HOME_BLOG_COUNT,
        );
        if (alive) {
          setBlogs(
            ok && items.length
              ? items.slice(0, HOME_BLOG_COUNT)
              : BLOG_FALLBACKS.slice(0, HOME_BLOG_COUNT),
          );
        }
      } catch (error) {
        console.error(error);
        if (alive) setBlogs(BLOG_FALLBACKS.slice(0, HOME_BLOG_COUNT));
      }
    }
    loadBlogs();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="section-full mobile-page-padding bg-white p-t30 p-b50 mobile-page-padding">
      <div className="container">
        <div className="section-head">
          <div className="sx-separator-outer separator-center">
            <div
              className="sx-separator bg-white bg-moving bg-repeat-x"
              style={{ backgroundImage: `url(${bgimg1})` }}
            >
              <h3 className="sep-line-one">Blog</h3>
            </div>
          </div>
        </div>
        <div className="section-content">
          <div className="row justify-content-center">
            {blogs.map((item, index) => {
              const blogId = getBlogId(item, index + 1);
              const detailLink = `/blog-detail/${blogId}`;
              const safeTitle = stripHtml(getBlogTitle(item));
              const safeVendor = stripHtml(getBlogVendor(item));
              const safeDesc = stripHtml(getBlogShort(item));
              const image = getBlogImage(item, BLOG_FALLBACK_IMAGE);

              return (
                <div
                  className="col-lg-4 col-md-6 col-sm-12 mb-4"
                  key={item?.id ?? index}
                >
                  <NavLink
                    to={detailLink}
                    state={{ id: blogId, blog: item }}
                    className="blog-grid date-style-2 solar-blog-card solar-blog-card-link"
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
          <div className="text-center m-t30">
            <NavLink to="/blog" className="site-button btn-half">
              <span>View all blogs</span>
            </NavLink>
          </div>
        </div>
      </div>
      <div className="hilite-title text-left text-uppercase">
        <strong>Blog</strong>
      </div>
    </div>
  );
}
