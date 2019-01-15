import React, { Component } from 'react';
import classes from './App.module.css';
import People from './containers/People/People';

class App extends Component {
  render() {
    return (
      <div className={classes.App}>
        <People/>
      </div>
    );
  }
}

export default App;
