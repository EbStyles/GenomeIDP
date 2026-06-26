import { useHistory } from 'react-router-dom'; // Use useHistory for v5
import { useAuthContext } from "../hooks/useAuthContext";

const P2Section4 = () => {

    const history = useHistory(); // Use useHistory for v5

    const { user } = useAuthContext();

    return (

        <div className="P2Section4">

            <img src="HowDoesItWork_Background.jpg" alt="How Does It Work Background" />

            <div className="P2Section4div">

                <h1>An IDP can be used to:</h1>

                <ul>

                    <li>Identify career goals that are compatible with what you really want</li>
                    <br />
                    <li>Define skills that you want to improve on to meet those goals</li>
                    <br />
                    <li>Make a short-term plan to help you get to your long-term goals</li>

                </ul>

                <p>
                    Ready to get started?
                </p>

                <div className="buttons">

                <button onClick={() => history.push(user ? '/form' : '/register')}>
      Take the Survey <span>→</span>
    </button>
                    
                </div >

                <div className="links">

                    <a href="https://www.linkedin.com/school/university-of-toronto-m-h-sc-in-medical-genomics/" target="_blank" rel="noopener noreferrer">
                        <img src="linkedin.png" alt="LinkedIn" />
                    </a>
                    <a href="https://www.instagram.com/uoftmedicalgenomics/" target="_blank" rel="noopener noreferrer">
                        <img src="instagram.png" alt="Instagram" />
                    </a>
                    <a href="https://www.tiktok.com/@uoftmedicalgenomics" target="_blank" rel="noopener noreferrer">
                        <img src="tik-tok.png" alt="TikTok" />
                    </a>
                    <a href="https://www.facebook.com/MolecularGeneticsUT" target="_blank" rel="noopener noreferrer">
                        <img src="facebook-app-symbol.png" alt="Facebook" />
                    </a>
                    <a href="https://x.com/i/flow/login?redirect_after_login=%2Fuoftmedgen" target="_blank" rel="noopener noreferrer">
                        <img src="twitter.png" alt="X" />
                    </a>

                </div>
            </div>

        </div>
    );
}

export default P2Section4;