import React from 'react';
import * as RelationshipService from '../services';

type Props = {
  relationships?: any;
  bug_id?: any;
  can_update?: any;
  warning?: string;
}

type States = {
  relationships: Array<any>,
  bugId: number,
  canUpdate: boolean,
  warning?: string,
  reqRelTyp: RelationshipType,
  reqRelDestIds: string,
}

enum RelationshipType {
  DUPLICATE_OF = 0,
  RELATED_TO = 1,
  PARENT_OF = 2,
  CHILD_OF = 3,
  HAS_DUPLICATE = 4,
}

export class IssueRelationships extends React.Component<Props, States> {

  constructor(props: Props) {
    super(props);

    this.state = {
      relationships: JSON.parse(this.props.relationships) || [],
      bugId: parseInt(this.props.bug_id) || 0,
      canUpdate: !!parseInt(this.props.can_update),
      warning: this.props.warning,
      reqRelTyp: RelationshipType.RELATED_TO,
      reqRelDestIds: ''
    }
  }

  async handleRelationshipAdd() {
    try {
      this.state.reqRelDestIds.split('|').forEach(async (id) => {
        const relationships = await RelationshipService.IssueRelationshipAdd(
          this.state.bugId,
          {
            type: { id: this.state.reqRelTyp },
            issue: { id: id },
          }
        );
        this.setState({ relationships });
      });
    } catch (error) {
      
    }
    this.setState({
      reqRelDestIds: '',
      reqRelTyp: RelationshipType.RELATED_TO
    });
    this.forceUpdate();
  }

  async handleRelationshipDelete(relId: number) {
    try {
      const relationships = await RelationshipService.IssueRelationshipDelete(
        this.state.bugId,
        relId
      );
      this.setState({ relationships });
    } catch (error) {

    }
    this.forceUpdate();
  }

  render() {
    const { relationships, canUpdate, warning, reqRelDestIds, reqRelTyp } = this.state;
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
              <option value={RelationshipType.PARENT_OF}>parent of</option>
              <option value={RelationshipType.CHILD_OF}>child of</option>
              <option value={RelationshipType.DUPLICATE_OF}>duplicate of</option>
              <option value={RelationshipType.HAS_DUPLICATE}>has duplicate</option>
              <option value={RelationshipType.RELATED_TO}>related to</option>
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
                {relationships.map((relationship: any, key: number) => (
                  <tr key={key}>
                    <td><span className='nowrap'>{relationship['type']}</span></td>
                    <td><a href={`view.php?id=${parseInt(relationship['issue_id'])}`}>{relationship['issue_id']}</a></td>
                    <td>
                      <i className={`fa fa-square fa-status-box ${relationship['issue_status_css']}`}></i>
                      &nbsp;
                      <span className='issue-status' title={relationship['issue_resolution'] || ''}>{relationship['issue_status_label']}</span>
                    </td>
                    <td>
                      <span className='nowrap'>
                        <a href={`view_user_page.php?id=${relationship['issue_handler_id']}`}>{relationship['issue_handler_name']}</a>
                      </span>
                    </td>
                    <td>
                      {relationship['issue_summary']}&nbsp;
                      {relationship['is_removal'] && (
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
