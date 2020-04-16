import React from 'react';
import ReactDOM from 'react-dom';
import { IssueRelationships } from './components/IssueRelationships';
import { IssueService } from './services';

if (document.getElementById('issue-data')) {
  const _compIssueData = document.getElementById('issue-data');
  const issueData = JSON.parse(_compIssueData?.dataset.issue!);

  if (issueData.issue && issueData.issue.relationships && document.getElementById('relationships-body')) {
    //const component = document.getElementById('relationships-body');
    //const props = Object.assign({}, component?.dataset);
    ReactDOM.render(
      <IssueRelationships
        issueId={issueData.issue.id}
        canUpdate={issueData.flags['relationships_can_update']}
        relationships={IssueService.RelationshipsParse(issueData.issue.relationships)}
      />,
      document.getElementById('relationships-body'));
  }
}


