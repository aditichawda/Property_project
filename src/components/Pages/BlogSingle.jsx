import React from "react";
import { NavLink } from "react-router-dom";
import Header2 from "./../Common/Header2";
import Banner from "./../Elements/Banner";
import Footer2 from "../Common/Footer2";
import { withRouter } from "../with";
import { stripHtml } from "../../utils/stripHtml";
import {
  fetchSolarBlogDetail,
  fetchSolarBlogList,
  parseSolarBlogDetailResponse,
  parseSolarBlogListResponse,
} from "../../api/solarBlog";
import {
  BLOG_FALLBACKS,
  getBlogId,
  getBlogDescription,
  getBlogImage,
  getBlogShort,
  getBlogTitle,
  getBlogVendor,
} from "../../utils/blogData";

const bnrimg = require("./../../images/property/5.jpg");
const BLOG_FALLBACK_IMAGE = require("./../../images/blog/default/thum1.jpg");

function resolveBlogId(router) {
  const paramsId = router?.params?.blogId;
  const stateId = router?.location?.state?.id;
  const queryId = new URLSearchParams(router?.location?.search || "").get("id");
  return paramsId ?? stateId ?? queryId ?? "";
}

function buildDetail(post) {
  if (!post) return null;
  return {
    ...post,
    title: getBlogTitle(post),
    vendorName: getBlogVendor(post),
    short: getBlogShort(post),
    description: getBlogDescription(post),
  };
}

class BlogSingle extends React.Component {
  state = {
    data: null,
    loading: true,
  };

  componentDidMount() {
    this.loadBlog();
  }

  componentDidUpdate(prevProps) {
    const prevId = resolveBlogId(prevProps.router);
    const nextId = resolveBlogId(this.props.router);
    if (String(prevId) !== String(nextId)) this.loadBlog();
  }

  async loadBlog() {
    const blogId = resolveBlogId(this.props.router);
    const stateBlog = this.props.router?.location?.state?.blog;
    this.setState({ loading: true });
    try {
      let detail = null;
      if (blogId) {
        const rawDetail = await fetchSolarBlogDetail(blogId);
        const parsed = parseSolarBlogDetailResponse(rawDetail);
        if (parsed.ok && parsed.detail) detail = parsed.detail;
      }

      if (!detail && blogId) {
        const rawList = await fetchSolarBlogList({ page: 1, perPage: 50 });
        const { ok, items } = parseSolarBlogListResponse(rawList, 1, 50);
        if (ok) {
          detail = items.find(
            (item) => String(getBlogId(item)) === String(blogId),
          );
        }
      }

      const fallback =
        stateBlog ||
        BLOG_FALLBACKS.find(
          (item) => String(getBlogId(item)) === String(blogId),
        ) ||
        BLOG_FALLBACKS[0];
      this.setState({
        data: buildDetail(detail || fallback),
        loading: false,
      });
    } catch (error) {
      console.error(error);
      const fallback =
        stateBlog ||
        BLOG_FALLBACKS.find(
          (item) => String(getBlogId(item)) === String(blogId),
        ) ||
        BLOG_FALLBACKS[0];
      this.setState({ data: buildDetail(fallback), loading: false });
    }
  }

  render() {
    const { data, loading } = this.state;
    const safeData = data || buildDetail(BLOG_FALLBACKS[0]);
    const bannerSrc = getBlogImage(safeData, BLOG_FALLBACK_IMAGE);
    const safeTitle = stripHtml(safeData?.title || "");
    const safeShort = stripHtml(safeData?.short || "");

    return (
      <>
        <Header2 />
        <div className="page-content">
          <Banner
            title="Blog Detail"
            pagename="Blog Single"
            description="Property buying, selling, listing, and enquiry tips."
            bgimage={bnrimg}
          />
          <div className="section-full p-t40 p-b50 inner-page-padding">
            <div className="container">
              <div className="text-right m-b20">
                {/* <button
                  type="button"
                  className="site-button btn-half"
                  onClick={() => {
                    if (window.history.length > 1) {
                      this.props.router.navigate(-1);
                    } else {
                      this.props.router.navigate("/blog");
                    }
                  }}
                >
                  <i className="fa fa-arrow-left m-r8 mr-2" />
                  <span>Back</span>
                </button> */}
                <NavLink to="/blog" className="seller-crm-btn-outline">
                  <i className="fa fa-arrow-left m-r8 mr-2" /> Back
                </NavLink>
              </div>
              {loading && !data ? (
                <p className="text-center p-a30 bg-white radius-md">

                </p>
              ) : null}
              <div className="blog-post blog-detail text-black">
                <div className="row">
                  <div className="col-lg-6 col-md-12">
                    <div className="sx-post-media">
                      <img
                        style={{
                          width: "100%",
                          height: "clamp(300px, 50vw, 500px)",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                        src={bannerSrc}
                        alt={safeTitle || "Blog"}
                        onError={(e) => {
                          e.currentTarget.src = BLOG_FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12">
                    <div
                      className="sx-post-title"
                      style={{ paddingLeft: "clamp(0px, 2vw, 30px)" }}
                    >
                      <div className="solar-blog-card__meta m-b10">
                        {safeData?.vendorName || "Property Guide"}
                      </div>
                      <h3
                        className="post-title"
                        style={{
                          fontSize: "2rem",
                          marginBottom: "clamp(15px, 2vw, 25px)",
                          textAlign: "justify",
                        }}
                      >
                        {safeTitle}
                      </h3>
                      {safeShort ? (
                        <p
                          style={{
                            fontSize: "1rem",
                            lineHeight: "1.6",
                            color: "#333",
                            marginBottom: "15px",
                            textAlign: "justify",
                          }}
                        >
                          {safeShort}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div
                  className="sx-post-text"
                  style={{ marginTop: "clamp(30px, 4vw, 50px)" }}
                >
                  <div
                    style={{
                      fontSize: "clamp(1rem, 2.2vw, 1.1rem)",
                      lineHeight: "1.7",
                      color: "#333",
                      textAlign: "justify",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: safeData?.description || "",
                    }}
                  />
                </div>

                <div className="p-t30">
                  <NavLink to="/blog" className="site-button-link">
                    Back to all blogs
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer2 />
      </>
    );
  }
}

export default withRouter(BlogSingle);
