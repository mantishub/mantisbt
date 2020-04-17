import React from 'react';
import ReactDOM from 'react-dom';
import { IssueRelationships } from './components/IssueRelationships';

if (document.getElementById('issue-data')) {
  const _compIssueData = document.getElementById('issue-data');
  const issueData = JSON.parse(_compIssueData?.dataset.issue!);

  if (issueData.issue && issueData.issue.relationships && document.getElementById('relationships-body')) {
    ReactDOM.render(
      <IssueRelationships
        issueId={issueData.issue.id}
        canUpdate={issueData.flags['relationships_can_update']}
        relationships={issueData.issue.relationships}
      />,
      document.getElementById('relationships-body'));
  }
}


