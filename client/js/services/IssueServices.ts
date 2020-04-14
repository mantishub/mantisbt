import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

export interface IssueRelationshipAddRequest {
  type: { id: number },
  issue: { id: string },
}

export const IssueRelationshipAdd = async (bugId: number, request: IssueRelationshipAddRequest, config: AxiosRequestConfig = {}) => {
  const url: string = `http://localhost:8888/mantisbt/api/rest/issues/${bugId}/relationships`;
  if (config.headers == null) {
    config.headers = {};
  }

  let response: AxiosResponse<any>;
  console.log('axios call');
  try {
    response = await axios.post<any>(url, request, config);
  }
  catch (e) {
    throw new Error(e);
  }

  console.log('response', response);
}