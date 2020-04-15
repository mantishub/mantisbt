import axios, { AxiosResponse } from 'axios';

export interface IssueRelationshipAddRequest {
  type: { id: number },
  issue: { id: string },
}

export const IssueRelationshipAdd = async (bugId: number, request: IssueRelationshipAddRequest) => {
  const url: string = `http://localhost:8888/mantisbt/api/rest/issues/${bugId}/relationships`;

  let response: AxiosResponse<any>;
  try {
    response = await axios.post<any>(url, request);
  }
  catch (e) {
    if (e.response && e.response.data)
      throw new Error(e.response.data.message);
    else
      throw new Error(e);
  }

  const relationships =  parseRelationships(response.data.issue.relationships);
  return relationships;
}

export const IssueRelationshipDelete = async (bugId: number, relationshipId: number) => {
  const url: string = `http://localhost:8888/mantisbt/api/rest/issues/${bugId}/relationships/${relationshipId}`;

  let response: AxiosResponse<any>;
  try {
    response = await axios.delete<any>(url);
  }
  catch (e) {
    if (e.response && e.response.data)
      throw new Error(e.response.data.message);
    else
      throw new Error(e);
  }

  const relationships =  parseRelationships(response.data.issue.relationships);
  return relationships;
}

const parseRelationships = (relationships: Array<any>): Array<any> => {
  return relationships.map(rel => {
    const issueId = rel.issue.id as number;
    return {
      id: rel.id,
      type: rel.type.label,
      issue_id: '0'.repeat(Math.max(7 - issueId.toString().length, 0)) + issueId,
      issue_status_label: rel.issue.status.label,
      issue_status_css: `status-${rel.issue.status.id}-fg`,
      issue_resolution: rel.issue.resolution.name,
      issue_summary: rel.issue.summary,
      issue_handler_id: rel.issue.handler.id,
      issue_handler_name: rel.issue.handler.name,
      is_removal: true,
    }
  })
};
