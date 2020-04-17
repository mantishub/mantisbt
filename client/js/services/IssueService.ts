import axios, { AxiosResponse } from 'axios';

export class IssueService {
  protected readonly issueId: number;

  constructor(issueId: number) {
    this.issueId = issueId;
  }

  public async RelationshipAdd(relationshipType: number, issueId: number) {
	const url: string = `api/rest/issues/${this.issueId}/relationships`;

	const request = {
		type: { id: relationshipType },
		issue: { id: issueId },
	};

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