import {useState,useEffect, forwardRef} from "react";

const testimonials = [
    { quote: '"GenomeIDP helped me to better understand where I am in my professional life as well as where I am looking to be. It asked me questions I would not normally have asked myself."'},

    { quote: '"GenomeIDP gave me a chance to explore careers that I had not thought of for myself before. "' },
    { quote: '"As I was working through the GenomeIDP self-assessment, I almost felt an "ah-ha moment" and realized things about myself I had not really appreciated before."'},
    {quote: '"I found GenomeIDP to be a fantastic check in with myself. Since taking the time to think hard about where I am in my career planning journey is not something I would normally do, I really enjoyed the process... I am very likely to revisit it as my career goals evolve."'},
    {quote: '"The guidance from GenomeIDP on how to grow professionally and how to explore possible career avenues was so helpful."'}
  ];


const Section5= forwardRef((props,ref) => {

    const [currentindex,setIndex] = useState(0);

    const handleClick = (index) => {
        setIndex(index);
    };

    useEffect(() => {
        const interval = setInterval(() => {
          setIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        }, 3000); // Change testimonial every 3 seconds
    
        return () => clearInterval(interval); // Cleanup the interval on component unmount
      }, []); // Empty dependency array ensures it runs once
    
    

    return ( 

        <div className = "Section5" ref={ref}>

            <span className="Section5header"> TESTIMONIALS </span>

        <div className="Testimonial">
            <blockquote>
                {testimonials[currentindex].quote}
            </blockquote>

        </div>

        <div className="nubs">
        {testimonials.map((_, index) => (
          <span
            key={index}
            className={`nub ${index === currentindex ? 'active' : ''}`}
            onClick={() => handleClick(index)}
          >
            ●
          </span>
        ))}
        </div>

        </div>
     );
});
 
export default Section5;