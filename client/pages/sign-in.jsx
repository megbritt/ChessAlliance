import React from 'react';
import GlobalContext from '../lib/global-context';

export default class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      passwordType: 'password',
      invalidLogin: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.togglePassword = this.togglePassword.bind(this);
  }

  handleChange(event) {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { username, password } = this.state;
    const { handleSignIn } = this.context;
    const body = { username, password };
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    };
    fetch('/api/auth/sign-in', req)
      .then(res => {
        if (res.status === 401) {
          this.setState({ invalidLogin: true });
          return;
        }
        return res.json();
      })
      .then(result => {
        if (!result) {
          return;
        }
        handleSignIn(result);
      });
  }

  togglePassword() {
    const { passwordType } = this.state;
    const nextType = passwordType === 'password' ? 'text' : 'password';
    this.setState({ passwordType: nextType });
  }

  render() {
    const { handleChange, handleSubmit } = this;
    const { username, password, passwordType, invalidLogin } = this.state;
    let errorClass = 'auth-error-box';
    let errorMessage = '';
    if (invalidLogin) {
      errorClass += ' show';
      errorMessage = 'Invalid login';
    }

    return (
      <form className="auth-form container page-height" onSubmit={handleSubmit}>
        <div className="row my-5">
          <div className="col text-center">
            <label htmlFor="username">
              <h1 className="auth-title">Login</h1>
            </label>
          </div>
        </div>

        <div className={errorClass}>
          <p className="auth-error-message">{errorMessage}</p>
        </div>

        <div className="row">
          <div className="col auth-field">
            <input
              required
              autoFocus
              type="text"
              name="username"
              id="username"
              placeholder="Username"
              value={username}
              className="auth-input"
              onChange={handleChange} />
          </div>
        </div>
        <div className="row pt-1">
          <div className="col auth-field">
            <input
              required
              type={passwordType}
              name="password"
              id="password"
              placeholder="Password"
              value={password}
              className="auth-input"
              onChange={handleChange} />
          </div>
        </div>

        <div className="row my-4">
          <div className="col p-0">
            <button className="auth-submit-btn sign-in">Log In</button>
          </div>
        </div>
      </form>
    );
  }
}

SignIn.contextType = GlobalContext;
