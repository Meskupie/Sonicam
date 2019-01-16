import React, { Component } from 'react';
import classes from './App.module.scss';
import People from './containers/People/People';
import Layout from './containers/Layout/Layout';

class App extends Component {
  render() {
    return (
      <div className={classes.App}>
        {/* <Layout/> */}
        <People/>
      </div>
    );
  }
}

export default App;
