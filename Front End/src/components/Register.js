import { useState } from 'react';
import image from "../GenomeIDP_Logo.png";
import { Link, useHistory } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [match, setMatch] = useState(null);
    const { signup, error, isLoading } = useRegister();
    const [showPassword, setShowPassword] = useState(false);
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMatch('Passwords do not match.');
            return;
        }

        const success = await signup(username, password);

        if (success) {
            console.log('User', username, 'has been registered.');
            history.push('/form');
            setUsername('');
            setPassword('');
            setConfirmPassword('');
            setMatch(null);
        }
    };


    const toggleShowPassword = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
        <div className="Register">
            <div className="FormContainer">
                <Link to='/' className='Logo'>
                    <img src={image} alt="GenomeIDP Logo" />
                </Link>

                <h2>Create an account to get started with GenomeIDP</h2>
                <div className="RegisterForm">
                    <form onSubmit={handleSubmit}>
                        <div className='inputDiv'>
                            <label>Username:</label>
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className='inputDiv'>
                            <label>Password:</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                className="showbutton"
                                type="button"
                                onClick={toggleShowPassword}
                            >
                                <img src={showPassword ? "view.png" : "hide.png"} alt="eye" />
                            </button>
                        </div>

                        <div className='inputDiv'>
                            <label>Confirm Password:</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                className="showbutton2"
                                type="button"
                                onClick={toggleShowPassword}
                            >
                                <img src={showPassword ? "view.png" : "hide.png"} alt="eye" />
                            </button>
                        </div>

                        <br />

                        <button
                            disabled={isLoading}
                            type="submit"
                            className={`registerbutton ${isLoading ? 'loading' : ''}`}
                        >
                            {isLoading ? 'Signing up...' : 'Sign up'}
                        </button>

                        {match && <p className='error'>{match}</p>}
                        {error && <p className='error'>{error}</p>}
                    </form>
                </div>

                <div className="login-link">
                    <p>Already have an account? <Link to="/login">Log in</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
