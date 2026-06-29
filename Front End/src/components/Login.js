
import { Link } from 'react-router-dom';
import image from "../GenomeIDP_Logo.png";
import { useState } from 'react';
import { useLogin } from '../hooks/useLogin';
import { useHistory } from 'react-router-dom'; // Use useHistory for v5

const Login = () => {

    const [showPassword, setShowPassword] = useState(false);

    const [password, setPassword] = useState('');

    const [username, setUsername] = useState('');

    const { login, isLoading, error } = useLogin();

    const history = useHistory(); // Use useHistory for v5

    const toggleShowPassword = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const success = await login(username, password);

        if (success) {
            history.push('/form');
        }
    };


    return (
        <div className="Login">
            <div className="LoginContainer">
                <Link to='/' className='Logo'>
                    <img src={image} alt="GenomeIDP Logo" />
                </Link>

                <h2>Login to continue your GenomeIDP journey</h2>

                <div className="LoginForm"> 
                	<form onSubmit={handleSubmit}>
                        <div>
                            <label>Username:</label>
                            <input
                                type="text"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label>Password:</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                className="showbutton3"
                                type="button"
                                onClick={toggleShowPassword}
                            >
                                <img src={showPassword ? "view.png" : "hide.png"} alt="eye" />
                            </button>
                        </div>

                        <button
                            disabled={isLoading}
                            type="submit"
                            className={`registerbutton ${isLoading ? 'loading' : ''}`}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                        {error && <p className="error">{error}</p>}
                    </form>
                </div>
                <div className="login-link">
                    <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
                </div>
            </div>

        </div>
    );
}

export default Login;
