import React, { Component } from 'react';
import {BrowserRouter, Route, Redirect, Switch} from 'react-router-dom'

import Auth from './pages/Auth'
import Events from './pages/Events'
import Bookings from './pages/Bookings'

class App extends Component {
  render() {
    return (
      <BrowserRouter>
      <Switch>
        <Redirect from="/" to="/auth" exact/>
        <Route path="/auth" component={Auth}/>
        <Route path="/events" component={Events}/>
        <Route path="/bookings" component={Bookings}/>
      </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
