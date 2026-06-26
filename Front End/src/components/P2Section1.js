import image from "../GenomeIDP_Logo.png";
import { Link } from 'react-router-dom';

const P2Section1 = () => {
    return (
        <div className="header">
            <Link to='/' className='Logo'>
                <img src={image} alt="GenomeIDP Logo" />
            </Link>

            <div className='Navbuttons'>
                <Link to='/' className='navGetStarted'>← Back to Home</Link>
            </div>

            <div className="auth-links">
    			<div className='headerLinks'>
        			<Link to='/Login'>Login</Link>
        			<Link to='/Register'>Sign up</Link>
    			</div>
			</div>
        </div>
    );
}

export default P2Section1;