import React from 'react';
import ReactDOM from 'react-dom';
import { IssueRelationships, MentionInput } from './components';
import { IssueService } from './services';

if (document.getElementById('issue-data')) {
  const issueData = JSON.parse(document.getElementById('issue-data')?.dataset.issue!);
  const stringsData = JSON.parse(document.getElementById('strings-data')?.dataset.strings!);
  const configsData = JSON.parse(document.getElementById('configs-data')?.dataset.configs!);

  if (issueData.issue && document.getElementById('relationships-body')) {
    const relationshipButtonsData = JSON.parse(document.getElementById('relationship-buttons-data')?.dataset.relationshipButtons!);

    ReactDOM.render(
      <IssueRelationships
        configs={configsData.configs}
        issueData={issueData}
        localizedStrings={stringsData.strings}
        relationshipButtons={relationshipButtonsData}
        warning={issueData.issue_view.relationships_warning}
      />,
      document.getElementById('relationships-body'));
  }
}

if (document.getElementById('bugnote_text')) {
  const noteElement = document.getElementById('bugnote_text')!;
  let issueId = 0;
  if (document.getElementsByName('bug_id')) {
    document.getElementsByName('bug_id').forEach(x => {
      const idVal = x.getAttribute('value');
      if (idVal) issueId = parseInt(idVal);
    })
  }
  if (!issueId && document.getElementById('issue-id')) {
    issueId = JSON.parse(document.getElementById('issue-id')?.dataset.issue!);
  }

  if (issueId > 0) {
    (new IssueService(issueId)).MentionUsersAutoComplete().then(data => {
      ReactDOM.render(
        <MentionInput
          mentionList={data}
          fieldId='bugnote_text'
          fieldStyle={noteElement.getAttribute('class') || undefined}
          fieldRows={noteElement.getAttribute('rows') ? parseInt(noteElement.getAttribute('rows')!) : undefined}
          fieldCols={noteElement.getAttribute('cols') ? parseInt(noteElement.getAttribute('cols')!) : undefined}
          fieldName={noteElement.getAttribute('name') || undefined}
          value={noteElement.textContent || ''} />,
        noteElement.parentElement!
      );
    });
  }
  else {
    ReactDOM.render(
      <MentionInput
        mentionList={[]}
        fieldId='bugnote_text'
        fieldStyle={noteElement.getAttribute('class') || undefined}
        fieldRows={noteElement.getAttribute('rows') ? parseInt(noteElement.getAttribute('rows')!) : undefined}
        fieldCols={noteElement.getAttribute('cols') ? parseInt(noteElement.getAttribute('cols')!) : undefined}
        fieldName={noteElement.getAttribute('name') || undefined}
        value={noteElement.textContent || ''} />,
      noteElement.parentElement!
    );
  }
}
