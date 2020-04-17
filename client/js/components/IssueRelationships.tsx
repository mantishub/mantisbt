import React from 'react';
import { ConfigService, IssueService } from '../services';
import { Relationship } from '../models';

type Props = {
  relationships: Array<Relationship>;
  issueId: number;
  canUpdate: boolean;
  warning?: string;
}

type States = {
  relationships: Array<Relationship>,
  reqRelTyp: RelationshipTypeEnum,
  reqRelDestIds: string,
}

enum RelationshipTypeEnum {
  DUPLICATE_OF = 0,
  RELATED_TO = 1,
  PARENT_OF = 2,
  CHILD_OF = 3,
  HAS_DUPLICATE = 4,
}

export class IssueRelationships extends React.Component<Props, States> {

  protected readonly Service: IssueService;

  constructor(props: Props) {
    super(props);

    this.state = {
      relationships: props.relationships,
      reqRelTyp: RelationshipTypeEnum.RELATED_TO,
      reqRelDestIds: ''
    };
    this.Service = new IssueService(props.issueId);
  }

  async handleRelationshipAdd() {
    try {
      this.state.reqRelDestIds.split('|').forEach(async (issueId) => {
		const relationships = await this.Service.RelationshipAdd(this.state.reqRelTyp, parseInt(issueId));
        this.setState({ relationships });
      });
    } catch (error) {
      
    }
    this.setState({
      reqRelDestIds: '',
      reqRelTyp: RelationshipTypeEnum.RELATED_TO
    });
    this.forceUpdate();
  }

  async handleRelationshipDelete(relId: number) {
    try {
      const relationships = await this.Service.RelationshipDelete(relId);
      this.setState({ relationships });
    } catch (error) {

    }
    this.forceUpdate();
  }

  render() {
    const { relationships, reqRelDestIds, reqRelTyp } = this.state;
    const { canUpdate, warning } = this.props;
    return relationships.length ? (
      <React.Fragment>
        <div className='widget-toolbox padding-8 clearfix'>
          {canUpdate && <div className='form-inline noprint'>
            <label className='inline'>Current issue&nbsp;&nbsp;</label>
            <select
              className='input-sm'
              name='rel_type'
              onChange={(e) => this.setState({ reqRelTyp: parseInt(e.target.value) })}
              value={reqRelTyp}
            >
              <option value={RelationshipTypeEnum.PARENT_OF}>parent of</option>
              <option value={RelationshipTypeEnum.CHILD_OF}>child of</option>
              <option value={RelationshipTypeEnum.DUPLICATE_OF}>duplicate of</option>
              <option value={RelationshipTypeEnum.HAS_DUPLICATE}>has duplicate</option>
              <option value={RelationshipTypeEnum.RELATED_TO}>related to</option>
            </select>
            &nbsp;
            <input
              type='text'
              className='input-sm'
              onChange={(e) => this.setState({ reqRelDestIds: e.target.value })}
              value={reqRelDestIds}
            />
            &nbsp;
            <button
              onClick={() => this.handleRelationshipAdd()}
              className='btn btn-primary btn-sm btn-white btn-round'
            >Add</button>
          </div>}
        </div>
        <div className='widget-main no-padding'>
          <div className='table-responsive'>
            <table className='table table-bordered table-condensed table-hover'>
              <tbody>
                {relationships.map((relationship: Relationship, key: number) => (
                  <tr key={key}>
                    <td><span className='nowrap'>{relationship.type.label}</span></td>
                    <td><a href={`view.php?id=${relationship.issue.id}`}>{relationship.issue.id}</a></td>
                    <td>
                      <i className={`fa fa-square fa-status-box`} style={{ color: relationship.issue.status?.color }}></i>
                      &nbsp;
                      <span className='issue-status' title={relationship.issue.resolution?.name || ''}>{relationship.issue.status?.label}</span>
                    </td>
                    <td>
                      <span className='nowrap'>
                        <a href={`view_user_page.php?id=${relationship.issue.handler?.id}`}>{relationship.issue.handler?.name}</a>
                      </span>
                    </td>
                    <td>
                      {relationship.issue.summary}&nbsp;
                      {canUpdate && (
                        <a
                          className='red noprint zoom-130'
                          onClick={() => this.handleRelationshipDelete(relationship['id'])}
                        >
                          <i className='ace-icon fa fa-trash-o bigger-115'></i>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
                {warning && (
                  <tr>
                    <td colSpan={5}><strong>{warning}</strong></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </React.Fragment>
    ) : null
  }
}
