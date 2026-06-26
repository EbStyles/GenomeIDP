import { forwardRef } from "react";

const Section6 = forwardRef((props,ref) => {
    return ( 

        <div className="Section6" ref={ref}>

        <div className="Section6info">
            <h4>CONTACT US</h4>
            <p>Want to get in touch with the GenomeIDP team? We would love to hear about your experience with GenomeIDP - feel free to write to us at <a href="mailto:medicalgenomics@utoronto.ca">medicalgenomics@utoronto.ca</a>.</p>

            <p>If you're an administrator or staff member from another institute outside the University of Toronto and you have questions about how GenomeIDP can work for your students, please reach out directly to Dr. Erin Styles at <a href="mailto:erin.styles@utoronto.ca">erin.styles@utoronto.ca</a>.</p>

            <p>Don't forget to look up our home department on social media!</p>

            <div className="links">

            <a href="https://www.linkedin.com/school/university-of-toronto-m-h-sc-in-medical-genomics/" target="_blank" rel="noopener noreferrer">
                <img src="linkedin.png" alt="LinkedIn"  />
            </a>
            <a href="https://www.instagram.com/uoftmedicalgenomics/" target="_blank" rel="noopener noreferrer">
                <img src="instagram.png" alt="Instagram"  />
            </a>
            <a href="https://www.tiktok.com/@uoftmedicalgenomics" target="_blank" rel="noopener noreferrer">
                <img src="tik-tok.png" alt="TikTok"  />
            </a>
            <a href="https://www.facebook.com/MolecularGeneticsUT" target="_blank" rel="noopener noreferrer">
                <img src="facebook-app-symbol.png" alt="Facebook"  />
            </a>
            <a href="https://x.com/i/flow/login?redirect_after_login=%2Fuoftmedgen" target="_blank" rel="noopener noreferrer">
                <img src="twitter.png" alt="X"  />
            </a>

            </div>

        </div>


        </div>


     );
});
 
export default Section6;