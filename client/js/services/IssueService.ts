import axios, { AxiosResponse } from 'axios';

export interface IssueRelationshipAddRequest {
  type: { id: number },
  issue: { id: string },
}

export class IssueService {
  protected readonly issueId: number;

  constructor(issueId: number) {
    this.issueId = issueId;
  }

  public async RelationshipAdd(request: IssueRelationshipAddRequest) {
    const url: string = `api/rest/issues/${this.issueId}/relationships`;

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

    return response.data.issue.relationships;
  }

  public async RelationshipDelete(relationshipId: number) {
    const url: string = `api/rest/issues/${this.issueId}/relationships/${relationshipId}`;

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
  
    return response.data.issue.relationships || [];
  }

}