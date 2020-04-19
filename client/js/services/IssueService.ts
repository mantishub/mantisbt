import axios, { AxiosResponse } from 'axios';

export class IssueService {
  protected readonly issueId: number;

  constructor(issueId: number) {
    this.issueId = issueId;
  }

  public async RelationshipAdd(relationshipType: number, issueId: number) {
	const addRelationshipUrl: string = `api/rest/issues/${this.issueId}/relationships`;
	const issueViewPageUrl: string = `api/rest/pages/issues/${this.issueId}/view`;

	const request = {
		type: { id: relationshipType },
		issue: { id: issueId },
	};

    let response: AxiosResponse<any>;
    try {
	  response = await axios.post<any>(addRelationshipUrl, request);
	  response = await axios.get<any>(issueViewPageUrl);
    }
    catch (e) {
      if (e.response && e.response.data)
        throw new Error(e.response.data.message);
      else
        throw new Error(e);
    }

    return response.data;
  }

  public async RelationshipDelete(relationshipId: number) {
    const deleteRelationshipUrl: string = `api/rest/issues/${this.issueId}/relationships/${relationshipId}`;
	const issueViewPageUrl: string = `api/rest/pages/issues/${this.issueId}/view`;

    let response: AxiosResponse<any>;
    try {
      response = await axios.delete<any>(deleteRelationshipUrl);
	  response = await axios.get<any>(issueViewPageUrl);
    }
    catch (e) {
      if (e.response && e.response.data)
        throw new Error(e.response.data.message);
      else
        throw new Error(e);
    }
  
    return response.data || [];
  }

  public async GetIssueBasic(issueId: number) {
    const issueBasicUrl: string = `api/rest/internal/issues/${issueId}/basic`;

    let response: AxiosResponse<any>;
    try {
	  response = await axios.get<any>(issueBasicUrl);
    }
    catch (e) {
      if (e.response && e.response.data)
        throw new Error(e.response.data.message);
      else
        throw new Error(e);
    }
  
    return response.data || [];
  }
}