
import useInView from "../useinview"; 

const Section3 = () => {
  
  const [headingInView, headingRef] = useInView({ threshold: 0.2 });
  const [item1InView, item1Ref] = useInView({ threshold: 0.2 });
  const [dot1InView, dot1Ref] = useInView({ threshold: 0.2 });
  const [item2InView, item2Ref] = useInView({ threshold: 0.2 });
  const [dot2InView, dot2Ref] = useInView({ threshold: 0.2 });
  const [item3InView, item3Ref] = useInView({ threshold: 0.2 });
  const [dot3InView, dot3Ref] = useInView({ threshold: 0.2 });
  const [item4InView, item4Ref] = useInView({ threshold: 0.2 });

  return (
    <div className="Section3">
      <div className="Section3heading appear" ref={headingRef}>
        <h1 className={headingInView ? "appear" : ""}>GenomeIDP by the Numbers</h1>
      </div>

      <div className="Midpart">
        <div className="item" ref={item1Ref}>
          <h2 className={item1InView ? "appear" : ""}>5+</h2>
          <p className={item1InView ? "appear dur13s" : ""}>Years in the making</p>
        </div>

        <div className="dot item" ref={dot1Ref}>
          <h2 className={dot1InView ? "appear dur13s" : ""}>.</h2>
        </div>

        <div className="item" ref={item2Ref}>
          <h2 className={item2InView ? "appear dur13s" : ""}>30+</h2>
          <p className={item2InView ? "appear dur15s" : ""}>Experts Consulted</p>
        </div>

        <div className="dot item" ref={dot2Ref}>
          <h2 className={dot2InView ? "appear dur13s" : ""}>.</h2>
        </div>

        <div className="item" ref={item3Ref}>
          <h2 className={item3InView ? "appear dur15s" : ""}>100+</h2>
          <p className={item3InView ? "appear dur19s" : ""}>Professional Survey Scorers</p>
        </div>

        <div className="dot item" ref={dot3Ref}>
          <h2 className={dot3InView ? "appear dur15s" : ""}>.</h2>
        </div>

        <div className="item" ref={item4Ref}>
          <h2 className={item4InView ? "appear dur19s" : ""}>14</h2>
          <p className={item4InView ? "appear dur22s" : ""}>Career Paths to Learn About</p>
        </div>
      </div>
    </div>
  );
};

export default Section3;
