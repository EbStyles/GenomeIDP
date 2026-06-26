import { forwardRef } from "react";
import useInView from "../useinview.js"


const Section2 = forwardRef((props,ref) => {
    
    const [headerInView, headerRef] = useInView({ threshold: 0.2 });
    const [quizInView, quizRef] = useInView({ threshold: 0.1 });
    const [reflectInView, reflectRef] = useInView({ threshold: 0.1 });
    const [planInView, planRef] = useInView({ threshold: 0.1 });
  
    return (
      <div className="Section2" ref={ref}>
        <div className="Section2header" ref={headerRef}>
          <h2 className={headerInView ? "appear" : ""}>OUR SERVICES</h2>
          <h1 className={headerInView ? "appear dur15s" : ""}>Explore Your Career Options</h1>
        </div>
        <div className="Section2body">
          <div>
            <img src="Quiz.png" alt="Quiz Logo" className={quizInView ? "appear dur15s" : ""} ref={quizRef} />
            <h6 className={quizInView ? "appear dur17s" : ""}>Take the quiz</h6>
          </div>
          <div>
            <img src="Reflect.png" alt="Reflect Logo" className={reflectInView ? "appear dur17s" : ""} ref={reflectRef} />
            <h6 className={reflectInView ? "appear dur19s" : ""}>Reflect</h6>
          </div>
          <div>
            <img src="Plan.png" alt="Plan Logo" className={planInView ? "appear dur2s" : ""} ref={planRef} />
            <h6 className={planInView ? "appear dur22s" : ""}>Plan Your Next Steps</h6>
          </div>
        </div>
      </div>
    );
  });
  
export default Section2;