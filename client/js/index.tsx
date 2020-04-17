import React from 'react';
import ReactDOM from 'react-dom';
import { IssueRelationships } from './components/IssueRelationships';

if (document.getElementById('issue-data')) {
  const issueData = JSON.parse(document.getElementById('issue-data')?.dataset.issue!);
  const stringsData = JSON.parse(document.getElementById('strings-data')?.dataset.strings!);
  const configsData = JSON.parse(document.getElementById('configs-data')?.dataset.configs!);

  if (issueData.issue && issueData.issue.relationships && document.getElementById('relationships-body')) {
    ReactDOM.render(
      <IssueRelationships
        issueId={issueData.issue.id}
        canUpdate={issueData.flags['relationships_can_update']}
        relationships={issueData.issue.relationships}
        localizedStrings={stringsData.strings}
        configs={configsData.configs}
      />,
      document.getElementById('relationships-body'));
  }
}


