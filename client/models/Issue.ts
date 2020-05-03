import { Relationship } from './Relationship';
import { User } from './User';

export interface Issue {
  id: number;

  summary: string;

  description?: string;

  project?: any;           /** Project **/

  category?: any;          /** Category **/

  reporter: User;

  handler?: User;

  status?: IssueStatus;

  resolution?: IssueResolution;

  view_state?: any;        /** View state **/

  priority?: any;

  severity?: any;

  reproducibility?: any;

  sticky?: boolean;

  created_at?: string;

  updated_at?: string;

  relationships?: Array<Relationship>;
  
  history?: Array<any>;

  notes?: Array<any>;
}

export interface IssueStatus {
  id: number;
  name: string;
  label: string;
  color: string;
}

export interface IssueResolution {
  id: number;
  name: string;
  label: string;
}
