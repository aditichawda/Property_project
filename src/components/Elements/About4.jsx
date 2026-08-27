import React from "react";

const locations = [
  {
    image: require("./../../images/property/about2.jpg"),
    title: "Who We Are",
    location: "Perth, Australia",
    algtag: "real estate marketplace",
    description:
      "We are Infrio — a team of engineers, architects, and designers driven by one mission: to turn ideas into inspiring spaces. What started as a humble venture in 2014 has grown into a trusted name in architecture, interiors, and construction solutions.\nFounded by Mrs. Pooja Malav, a Civil Engineer from GSITS Indore, and strengthened by the expertise of Mr. Rajesh Malav, Infrio brings together creativity, precision, and execution excellence. With over 100 completed projects across homes, offices, and commercial buildings, we have built our reputation on quality, transparency, and innovation.\nAt Infrio, we don’t just design or build structures — we create experiences. Every project is a blend of thoughtful planning, smart engineering, and aesthetic detailing, tailored to meet our clients’ needs and aspirations.",
  },
  
  {
    image: require("./../../images/property/home6.jpg"),
    title: "Our Vision",
    location: "Muscat, Sultanate of Oman.",
    algtag: "online property marketplace",
    description:
      "At Infrio, our vision is to redefine the way spaces are imagined, designed, and built. We aspire to be recognized as a trusted partner in delivering innovative, sustainable, and future-ready solutions that balance functionality with aesthetics.\nWe aim to create a legacy where every project — from a simple home to a landmark building — reflects our commitment to quality, transparency, and customer satisfaction. By combining engineering excellence with creative design, we envision Infrio as a brand that not only builds structures, but also inspires lives.",
  },
  // {
  //     image: require('./../../images/our-history/2.jpg'),
  //     title: 'Drana Villa, CA',
  //     location: 'Amman, Jordan',
  //     description: 'The floor looks magnificent and the parquet in the hall sets it off beautifully. Your men were excellent, you were delightful and nothing was too much trouble for you. You have very tidy workers, covering everything, and the house was left in a good shape as the condition allowed.',
  // },
  // {
  //     image: require('./../../images/our-history/3.jpg'),
  //     title: 'House Office, CA',
  //     location: 'Casablanca, Morocco',
  //     description: 'I just wanted to say thank you and the team very much for the brilliant service around renovating the floors at our house. You were absolutely brilliant and we can see you’ve gone the extra mile matching the floors between rooms etc. You’ve kept the place really tidy too, cannot ask for more.',
  // },
  // {
  //     image: require('./../../images/our-history/5.jpg'),
  //     title: 'French Embassy',
  //     location: 'Perth, Australia',
  //     description: 'I just wanted to say thank you and the team very much for the brilliant service around renovating the floors at our house. You were absolutely brilliant and we can see you’ve gone the extra mile matching the floors between rooms etc. You’ve kept the place really tidy too, cannot ask for more.',
  // },
  // {
  //     image: require('./../../images/our-history/6.jpg'),
  //     title: 'Art Museum',
  //     location: 'Muscat, Sultanate of Oman.',
  //     description: 'Fantastic service from start to finish. After our ceiling collapsed we never thought our damaged floor would look so good again. These guys worked in a tight time frame and were very accommodating to the other trades working in the same area to produce brilliant results and restore our badly damaged floor to look like new!',
  // },
  // {
  //     image: require('./../../images/our-history/7.jpg'),
  //     title: 'Drana Villa, CA',
  //     location: 'Amman, Jordan',
  //     description: 'The floor looks magnificent and the parquet in the hall sets it off beautifully. Your men were excellent, you were delightful and nothing was too much trouble for you. You have very tidy workers, covering everything, and the house was left in a good shape as the condition allowed.',
  // },
  // {
  //     image: require('./../../images/our-history/8.jpg'),
  //     title: 'House Office, CA',
  //     locatio: 'Casablanca, Morocco',
  //     description: 'I just wanted to say thank you and the team very much for the brilliant service around renovating the floors at our house. You were absolutely brilliant and we can see you’ve gone the extra mile matching the floors between rooms etc. You’ve kept the place really tidy too, cannot ask for more.',
  // }
];

class About4 extends React.Component {
  render() {
    return (
      <>
        <div className="section-full p-t80 p-b50 bg-white inner-page-padding">
          <div className="container">
            <div className="section-content ">
              <div className="our-history text-black">
                {locations.map((item, index) => (
                  <div className="row" key={index}>
                    <div className="col-12 pic-bg-border">
                      <div
                        className="our-history-pic bg-no-repeat bg-center bg-cover"
                        data-stellar-background-ratio="0.5"
                        style={{ backgroundImage: "url(" + item.image + ")" }}
                        aria-label={item.algtag}
                        title={item.algtag}
                      ></div>
                    </div>
                    <div className="col-12">
                      <div className="our-history-content m-b30">
                        <div className="large-title">
                          <h2 className="m-t0">{item.title}</h2>
                          {/* <h4>{item.location}</h4> */}
                        </div>
                        <p
                          style={{
                            whiteSpace: "pre-line",
                            textAlign: "justify",
                          }}
                        >
                          {item.description}
                        </p>
                        {/* <NavLink to={"/about-1"} className="site-button-secondry btn-half"><span> View All</span></NavLink> */}
                      </div>
                    </div>
                  </div>
                ))}
                {/* <div className="text-center load-more-btn-outer" style={{ backgroundImage: 'url(' + bgimg1 + ')' }}>
                                    <button id="loadMorebtn-5" className="site-button-secondry btn-half"><span>Load More</span></button>
                                </div> */}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default About4;
