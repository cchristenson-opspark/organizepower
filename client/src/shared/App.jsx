import React, { useState } from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
// import axios from 'axios';

import { render } from 'react-dom';
import Navbar from './Navbar.jsx';
import Explore from '../explore/Explore.jsx';
import MovementList from './MovementList.jsx';
import Profile from '../profile/Profile.jsx';
import Login from '../login/Login.jsx';

import { fakeUsers } from '../services/fakeData';

const App = () => {
  const user = fakeUsers[0];

  return (
    <div>
      <Navbar user={user} />
      {/* <MovementList /> */}

    </div>
  );
};

export default App;
