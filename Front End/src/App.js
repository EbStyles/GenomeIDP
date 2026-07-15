import './App.css';
import image from "./GenomeIDP_Logo.png";
import Form from './components/Form';
import Login from './components/Login';
import Page2 from './components/Page2';
import Register from './components/Register';
import Section1 from './components/Section1';
import Section2 from './components/Section2';
import Section3 from './components/Section3';
import Section4 from './components/Section4';
import Section5 from "./components/Section5";
import Section6 from './components/Section6';
import Results from "./components/Results"
import { useRef } from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import { useLogout } from './hooks/useLogout';
import { useAuthContext } from './hooks/useAuthContext';
import CareerDetails from './components/careers';
import AdminPage from './components/admin';
import CareerResourcesPage from './components/CareerResourcesPage';
import Privacy from './components/Privacy';

// Inner component — useHistory must be called inside the Router, not alongside it
function AppInner() {
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section4Ref = useRef(null);
  const section5Ref = useRef(null);
  const section6Ref = useRef(null);

  const { logout } = useLogout();
  const { user } = useAuthContext();
  const history = useHistory();

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClick = async (e) => {
    logout()
  }

  return (
    <div className="App" style={{
      backgroundImage: `url("HomePageHelix_V2.png")`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed"
    }}>
      <Switch>
        <Route exact path="/">
          <div className="header">
            <Link to='/' className='Logo'>
              <img src={image} alt="GenomeIDP Logo" />
            </Link>

            <div className='Navbuttons'>
              <button onClick={() => scrollToSection(section1Ref)}>Home</button>
              <span>|</span>
              <button onClick={() => history.push('/IDP')}>Get Started</button>
              <span>|</span>
              <button onClick={() => scrollToSection(section4Ref)}>About</button>
              <span>|</span>
              <button onClick={() => scrollToSection(section5Ref)}>Testimonials</button>
              <span>|</span>
              <button onClick={() => scrollToSection(section6Ref)}>Contact Us</button>
            </div>

            <div className="auth-links">
              {user && (
                <div>
                  <button onClick={handleClick} className='logoutButton'>Logout</button>
                </div>
              )}
              {!user && (
                <div className='headerLinks'>
                  <Link to='/Login'> Login </Link>
                  <Link to='/Register'> Sign up</Link>
                </div>
              )}
            </div>
          </div>

          <Section1 ref={section1Ref} />
          <Section2 ref={section2Ref} />
          <Section3 />
          <Section4 ref={section4Ref} />
          <Section5 ref={section5Ref} />
          <Section6 ref={section6Ref} />
        </Route>

        <Route path="/Register"><Register /></Route>
        <Route path="/Login"><Login /></Route>
        <Route path="/IDP"><Page2 /></Route>
        <Route path="/results"><Results /></Route>
        <Route path="/form"><Form /></Route>
        <Route path="/career/:careerName"><CareerDetails /></Route>
        <Route path="/admin"><AdminPage /></Route>
        <Route path="/resources/:careerName" component={CareerResourcesPage} />
        <Route path="/privacy"><Privacy /></Route>
      </Switch>
    </div>
  );
}

// Outer component — Router wraps everything so useHistory works inside AppInner
function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;