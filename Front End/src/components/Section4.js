import { forwardRef } from "react";
import useInView from "../useinview.js"

const Section4 = forwardRef((props, ref) => {

    const [headerInView, headerRef] = useInView({ threshold: 0.2 });
    const [header2InView, header2Ref] = useInView({ threshold: 0.2 });
    const [parInView, parRef] = useInView({ threshold: 0.02 });

    return ( 

        <div className="Section4" ref={ref}>

            <h4 ref={headerRef} className = {headerInView ? "appear" : ""}>ABOUT US</h4>
            <h2 ref={header2Ref} className = {header2InView ? "appear dur13s" : ""}>Meet the <br/> GenomeIDP Team</h2>

            <p ref={parRef} className = {parInView ? "appear dur15s" : ""}>
            GenomeIDP was developed by Dr. Erin Styles, an Associate Professor in the teaching stream in the Department of Molecular Genetics and Temerty Faculty of Medicine at the University of Toronto. As the Director of a Masters of Health Sciences program in Medical Genomics, Erin realized that existing career planning tools for graduate students - which are mostly oriented towards PhD students - weren't making the cut for students in the Masters stream, who do not necessarily intend to pursue PhD-level studies. <br/> <br/>
            With this realization, GenomeIDP was born. Supported by Drs. Johanna Carroll, Martina Steiner, and Nana Lee, Research Assistant Clincy Saldana, Web Developer Faizan Hasan, and the collective expert insights of more than 130 academic, industry, policy, and business professionals working in areas related to genetics, genomics, biochemistry, and molecular biology, the GenomeIDP team is passionate about helping students succeed professionally. Whether you've already got a plan or are just starting to think about what comes next, GenomeIDP is here to help you achieve your career goals. 
            </p>


        </div>


     );
});

export default Section4;