import React from 'react';
import ReactDOM from 'react-dom';
import { IssueRelationships } from './components/IssueRelationships';

if (document.getElementById('issue-data')) {
  const issueData = JSON.parse(document.getElementById('issue-data')?.dataset.issue!);
  const stringsData = JSON.parse(document.getElementById('strings-data')?.dataset.strings!);
  const configsData = JSON.parse(document.getElementById('configs-data')?.dataset.configs!);

  if (issueData.issue && issueData.issue.relationships && document.getElementById('relationships-body')) {
    const relationshipButtonsData = JSON.parse(document.getElementById('relationship-buttons-data')?.dataset.relationshipButtons!);

    ReactDOM.render(
      <IssueRelationships
        configs={configsData.configs}
        issueData={issueData}
        localizedStrings={stringsData.strings}
        relationshipButtons={relationshipButtonsData}
      />,
      document.getElementById('relationships-body'));
  }
}


