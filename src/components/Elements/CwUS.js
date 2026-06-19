import React from 'react';
import { NavLink } from 'react-router-dom';

const services = [
    {
        count: '01',
        title: 'Discussion',
        flaticon: 'flaticon-sketch',
        image: require('./../../images/services/service-projects/1.jpg'),
        description: 'Our team also provides consultations on all architectural issues, even if you need.'
    },
    {
        count: '02',
        title: 'Requirement Gathering',
        flaticon: 'flaticon-stairs',
        image: require('./../../images/services/service-projects/2.jpg'),
        description: 'We combine Interior and Exterior Design services and often provide them as a single solution.'
    },
    {
        count: '03',
        title: 'Payment & Execution',
        flaticon: 'flaticon-payment',
        image: require('./../../images/services/service-projects/3.jpg'),
        description: 'Landscape plans for drainage problems may also entail planting beds away'
    },
     {
        count: '04',
        title: 'Modifications & Delivery',
        flaticon: 'flaticon-window',
        image: require('./../../images/services/service-projects/3.jpg'),
        description: 'Landscape plans for drainage problems may also entail planting beds away'
    }
]
var bgimg2 = require('./../../images/background/cross-line2.png');

class CWUS extends React.Component {
    render() {

        return (
            <>
                <div className="section-full mobile-page-padding bg-white">
                    <div className="container">
                        <div className="row">
                            {services.map((item, index) => (
                                
                                <div className="col-lg-3 col-md-6 col-sm-12 m-b30" key={index}>
                                    <div className="service-card bg-white border-radius-10 shadow-sm h-100 d-flex flex-column justify-content-center align-items-center text-center p-4" style={{ minHeight: '300px' }}>
                                        <div className="service-number mb-3">
                                            <span className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', fontSize: '1.2rem', fontWeight: 'bold' ,backgroundColor:"red"}}>
                                                {item.count}
                                            </span>
                                        </div>
                                        <div className="service-icon mb-3" style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div className="icon-lg" style={{color:"black"}}>
                                                <span className="icon-cell" style={{}}>
                                                    {item.count === '03' ? (
                                                        <img 
                                                            src={require('./../../images/payment-method.png')} 
                                                            alt="Payment Method" 
                                                            style={{ width: '50px', height: '60px', objectFit: 'contain' }} 
                                                        />
                                                    ) : (
                                                        <i className={item.flaticon} style={{ fontSize: '2.5rem', }} />
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="service-content">
                                            <h4 className="sx-tilte mb-3">
                                                <NavLink to={""} className="text-dark text-decoration-none">
                                                    {item.title}
                                                </NavLink>
                                            </h4>
                                            <p className="text-muted mb-0">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }
};

export default CWUS;