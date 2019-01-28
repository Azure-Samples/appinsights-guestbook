import React from 'react';
import ReactDOM from 'react-dom';
import GBForm from './GBForm';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<GBForm />, div);
});
