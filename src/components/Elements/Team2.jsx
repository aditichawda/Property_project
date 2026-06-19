// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import OwlCarousel from 'react-owl-carousel';
// import 'owl.carousel/dist/assets/owl.carousel.css';
// import 'owl.carousel/dist/assets/owl.theme.default.css';

// const teamMembers = [
//     {
//         image: require('./../../images/our-team5/1.jpg'),
//         membername: 'Johnny Jackman',
//         position: 'Architect'
//     },
//     {
//         image: require('./../../images/our-team5/2.jpg'),
//         membername: 'Daniel Rickman',
//         position: 'Architect'
//     },
//     {
//         image: require('./../../images/our-team5/3.jpg'),
//         membername: 'Mark Norwich',
//         position: 'Architect'
//     }
// ]

// var bgimg1 = require('./../../images/background/cross-line2.png');

// class Team2 extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             apiData: [],   // API ka data save karne ke liye
//             loading: true, // loading state
//             error: null    // error handle karne ke liye
//         };
//     }

//     componentDidMount() {
//         const requestOptions = {
//             //  mode: 'no-cors',
//             method: "GET",
//             headers: {
//       "Content-Type": "application/json",
//     },
//         };

//         fetch("https://www.admin.infrioindia.com/api/v2/auth/testimonial-list", requestOptions)
//             .then((response) => response.json()) // response ko JSON me convert
//             .then((result) => {
//                 console.log("API Result:", result);
//                 this.setState({ apiData: result.data, loading: false });
//             })
//             .catch((error) => {
//                 console.error("API Error: Lakshay", error);
//                 this.setState({ error: error, loading: false });
//             });
//     }

//     render() {
//                         const { apiData, loading, error } = this.state;
// const options = {
//            loop:true,
//             autoplay:false,
//             center: false,
//             margin:0,
//             nav: true,
//             dots: false,
//             navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
//             responsive:{
//                 0:{
//                     items:1
//                 },
//                 768:{
//                     items:2
//                 },			 
//                 991:{
//                     items:3
//                 },
//                 1200:{
//                     items:4
//                 }	
                
//             }
//         };
//         return (
//             <>
//                 <div className="section-full p-t80 p-b50 bg-gray mobile-page-padding">
//                     <div className="container">
//                         {/* TITLE START */}
//                         <div className="section-head">
//                             <div className="sx-separator-outer separator-center">
//                                 <div className="sx-separator bg-white bg-moving bg-repeat-x" style={{ backgroundImage: 'url(' + bgimg1 + ')' }}>
//                                     <h3 className="sep-line-one">Our Architects</h3>
//                                 </div>
//                             </div>
//                         </div>
//                         {/* TITLE END */}
//                         {/* IMAGE CAROUSEL START */}
                       
//                         <div className="section-content">
                         
//                             <div className="row justify-content-center">
                                  
//                                 {apiData.slice(0,3).map((item, index) => (
//                                     <div className="col-lg-4 col-md-6 col-sm-12 m-b30" key={index}>
//                                         <div className="our-team-3">
//                                             <div className="our-team-info ">
//                                                 <img src={item.icon} alt="" />
//                                                 <div className="our-team-content">
//                                                     <h4 className="sx-team-name">{item.name}</h4>
//                                                     <span className="sx-team-position text-white">{item.designation}</span>
//                                                     {/* <p>
//                                                         <a href="https://www.facebook.com"><i className="fa fa-facebook" /></a>
//                                                         <a href="https://www.twitter.com"> <i className="fa fa-twitter" /></a>
//                                                         <a href="https://www.instagram.com"> <i className="fa fa-instagram" /></a>
//                                                         <a href="https://in.linkedin.com"> <i className="fa fa-linkedin" /></a>
//                                                     </p> */}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
                           
//                             </div>
                         
//                         </div>
                       
//                     </div>
//                     <div className="hilite-title text-left p-l50 text-uppercase">
//                         <strong>Architects</strong>
//                     </div>
//                 </div>
//             </>
//         );
//     }
// };

// export default Team2;

import React from 'react';
import { NavLink } from 'react-router-dom';
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

var bgimg1 = require('./../../images/background/cross-line2.png');

class Team2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            apiData: [],
            loading: true,
            error: null
        };
    }

    componentDidMount() {
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        };

        fetch("https://www.admin.infrioindia.com/api/v2/auth/our-architects-list", requestOptions)
            .then((response) => response.json())
            .then((result) => {
                console.log("API Result:", result);
                this.setState({ apiData: result.data, loading: false });
            })
            .catch((error) => {
                console.error("API Error: Lakshay", error);
                this.setState({ error: error, loading: false });
            });
    }

    render() {
        const { apiData, loading, error } = this.state;

        const options = {
            loop: true,
            autoplay: false,
            center: false,
            margin: 30,
            nav: true,
            dots: false,
            navText: [
                '<i class="fa fa-angle-left"></i>',
                '<i class="fa fa-angle-right"></i>'
            ],
            responsive: {
                0: { items: 1 },
                768: { items: 2 },
                991: { items: 3 },
                1200: { items: 3 }
            }
        };

        return (
            <>
                <div className="section-full p-t80 p-b60 bg-gray mobile-page-padding">
                    <div className="container">
                        {/* TITLE START */}
                        <div className="section-head">
                            <div className="sx-separator-outer separator-center">
                                <div
                                    className="sx-separator bg-white bg-moving bg-repeat-x"
                                    style={{ backgroundImage: 'url(' + bgimg1 + ')' }}
                                >
                                    <h3 className="sep-line-one">Our Architects</h3>
                                </div>
                            </div>
                        </div>
                        {/* TITLE END */}

                        {/* IMAGE CAROUSEL START */}
                        <div className="section-content">
                            {!loading && !error && apiData.length > 0 && (
                            <OwlCarousel className="owl-theme" {...options}>
                                {apiData.map((item, index) => (
                                    <div className="item" key={index}>
                                        <div className="our-team-3">
                                            <div className="our-team-info" style={{ position: 'relative', overflow: 'hidden' }}>
                                                <img 
                                                    src={item.icon} 
                                                    alt={item.name} 
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '400px', 
                                                        objectFit: 'cover',
                                                        objectPosition: 'center',
                                                        display: 'block'
                                                    }} 
                                                />
                                                <div className="our-team-content">
                                                    <h4 className="sx-team-name text-white">{item.name}</h4>
                                                    <span className="sx-team-position text-white">{item.designation}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </OwlCarousel>
                            )}
                        </div>
                    </div>

                    <div className="hilite-title text-center p-l50 text-uppercase">
                        <strong>Architects</strong>
                    </div>
                </div>
            </>
        );
    }
}

export default Team2;
