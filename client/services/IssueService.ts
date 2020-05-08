import axios, { AxiosResponse } from 'axios';

export class IssueService {
  protected readonly issueId: number;

  constructor(issueId: number = 1) {
    this.issueId = issueId;
  }

  public static async GetIssues() {
    const apiUrl: string = `api/rest/issues`;

    let response: AxiosResponse<any>;
    try {
      response = await axios.get<any>(apiUrl);
    }
    catch (e) {
      if (e.response && e.response.data) {
        throw new Error(e.response.data.message);
	  }

	  throw new Error(e);
    }

    return response.data.issues || [];
  }

  public async RelationshipAdd(relationshipType: number, issueId: number) {
    const addRelationshipUrl: string = `api/rest/issues/${this.issueId}/relationships`;
    const issueViewPageUrl: string = `api/rest/pages/issues/${this.issueId}/view`;

    const request = {
      type: { id: relationshipType },
      issue: { id: issueId },
    };

    let response: AxiosResponse<any>;
	response = await axios.post<any>(addRelationshipUrl, request);
	response = await axios.get<any>(issueViewPageUrl);

    return response.data;
  }

  public async RelationshipDelete(relationshipId: number) {
    const deleteRelationshipUrl: string = `api/rest/issues/${this.issueId}/relationships/${relationshipId}`;
	  const issueViewPageUrl: string = `api/rest/pages/issues/${this.issueId}/view`;

    let response: AxiosResponse<any>;
	response = await axios.delete<any>(deleteRelationshipUrl);
	response = await axios.get<any>(issueViewPageUrl);
  
    return response.data || [];
  }

  public async RelationshipInputAutoComplete(field: string, prefix: string) {
    const autoCompleteUrl: string = `api/rest/internal/autocomplete`;

    let response: AxiosResponse<any>;
	response = await axios.post(autoCompleteUrl, { field, prefix });

	let ids: Array<string> = response.data;
	ids = ids.filter(id => this.issueId !== parseInt(id));

	const data: Array<any> = await Promise.all(
		ids.map(async (id): Promise<any> => {
			const basicIssueResponse = await this.GetIssueBasic(parseInt(id));
			return {
				id: id,
				title: basicIssueResponse.issue.title
			};
		})
	);

	return data;
  }

  public async GetIssueBasic(issueId: number) {
    const issueBasicUrl: string = `api/rest/internal/issues/${issueId}/basic`;

    let response: AxiosResponse<any>;
    try {
	    response = await axios.get<any>(issueBasicUrl);
    }
    catch (e) {
      if (e.response && e.response.data) {
        throw new Error(e.response.data.message);
	  }

      throw new Error(e);
    }
  
    return response.data || [];
  }

  public async MentionUsersAutoComplete() {
    const autoCompleteUrl: string = `api/rest/internal/issues/${this.issueId}/mention_candidates`;

    let response: AxiosResponse<any>;
	response = await axios.get<any>(autoCompleteUrl);
	return response.data.users;
  }
}