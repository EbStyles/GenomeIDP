import { forwardRef } from "react";
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

const Section1 = forwardRef((props,ref) => {
    return ( 
        <div className='Section1' ref={ref}  >
         
         <div className='subheading appear'>
            <h1>Welcome to GenomeIDP</h1>
         </div>
         <div className='subfont appear dur15s'>
            <p>GenomeIDP is a career planning guide for genetics, genomics, and molecular biology Masters students. Our mission is to give you a guided opportunity to reflect on your skills, interests, and values to identify career paths that will be meaningful and fulfilling for you after graduate school.</p>
            </div>
            <div className='button appear dur2s'>
            <Link to = "./IDP"> Get Started</Link>
         </div>
         </div>





     );
});
 
export default Section1;