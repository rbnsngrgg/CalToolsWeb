import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Login from './components/login';
import Register from './components/register';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
      <div>
        <Router>
          <div>
            <Route exact path="/" render={() => <h1>Home route</h1>}/>
            <Route exact path="/register" component={Register}/>
            <Route exact path="/login" component={Login}/>
          </div>
        </Router>
      </div>
    </div>
  );
}

export default App;
