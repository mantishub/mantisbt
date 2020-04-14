import React from 'react';
import ReactDOM from 'react-dom';
import { IssueRelationships } from './components/IssueRelationships';

if (document.getElementById('relationships-body')) {
  const component = document.getElementById('relationships-body');
  const props = Object.assign({}, component?.dataset);
  ReactDOM.render(<IssueRelationships {...props} />, document.getElementById('relationships-body'));
}

