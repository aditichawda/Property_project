import React from 'react';
import { NavLink } from 'react-router-dom';
import Header2 from './../Common/Header2';
import Footer from './../Common/Footer';
import Banner from './../Elements/Banner';
import Footer2 from '../Common/Footer2';
import Header4 from './../Common/Header4';
var bnrimg = require('./../../images/banner/5.jpg');
var bgimg1 = require('./../../images/background/cross-line.png');

class ProjectGrid4 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: [],
      isLoading: true,
    };
  }

  async componentDidMount() {
    // custom.js load
    this.loadScript('./assets/js/custom.js');

    // API call
    await this.fetchVideos();
  }

  loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.addEventListener('load', function () {
        resolve();
      });
      script.addEventListener('error', function (e) {
        reject(e);
      });
      document.body.appendChild(script);
      document.body.removeChild(script);
    });
  }

  async fetchVideos() {
    try {
      const response = await fetch(
        'https://www.googleapis.com/youtube/v3/search?key=AIzaSyA-hZXpdlqViCtrlJVzepY1hq5EiCn04sw&channelId=UCSbowFHQ1v_UjoAqLmQff-g&part=snippet&order=date&maxResults=50'
      );

      const data = await response.json();

      // youtube response items को state में डालना
      this.setState({
        videos: data.items,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching videos:', error);
      this.setState({ isLoading: false });
    }
  }

  render() {
    const { videos, isLoading } = this.state;

    return (
      <>
        <Header2 />
        <div className="page-content">
          <Banner
            title="Video Gallery"
            pagename="Video Gallery"
            description="Our Love for Architecture
We are A Passionate Team Dedicated To Creating Stunning Architecture."
            bgimage={bnrimg}
          />

          {/* SECTION CONTENT START */}
          <div className="section-full p-tb80 column-grid-4 inner-page-padding">
            <div className="container">
              {isLoading ? (
                <p className="text-center">Loading videos...</p>
              ) : (
               <ul className="masonry-outer mfp-gallery row work-grid clearfix list-unstyled">
  {videos.map((item, index) => (
    <div
      key={index}
      className="masonry-item col-xl-3 col-lg-4 col-md-6 col-sm-12 m-b30"
    >
      <div className="video-card">
        <div className="video-frame">
          <iframe
            src={`https://www.youtube.com/embed/${item.id.videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={item.snippet.title}
          />
        </div>
        <h5 className="video-title">{item.snippet.title}</h5>
      </div>
    </div>
  ))}
</ul>

              )}

              {/* GALLERY CONTENT END */}
              <div
                className="text-center load-more-btn-outer"
                style={{ backgroundImage: 'url(' + bgimg1 + ')' }}
              >
                <button className="site-button-secondry btn-half">
                  <span>Load More</span>
                </button>
              </div>
            </div>
          </div>
          {/* SECTION CONTENT END  */}
        </div>

        <Footer2 />
      </>
    );
  }
}

export default ProjectGrid4;
