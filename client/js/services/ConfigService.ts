import axios, { AxiosResponse } from 'axios';

export interface ConfigGetRequest {
  option: string | Array<string>;
  project_id?: number;
  user_id?: number;
}

export class ConfigService {
  constructor() {
  }

  public static async GetConfig(request: ConfigGetRequest) {
    const url: string = `api/rest/config/`;

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

    return response.data.configs;
  }
}