import React from 'react';
import { IssueService } from '../services';
import { Relationship } from '../models';

type Props = {
  /**
   *  The flag checking issue can be updated
   */
  canUpdate: boolean;

  /**
   *  Config values array from div configs-data
   */
  configs: Array<any>;

  /**
   *  Id of issue
   */
  issueId: number;

  /**
   *  Localized strings array from div strings-data
   */
  localizedStrings: Array<any>;

  /**
   *  Relationships array from div issue-data
   */
  relationships: Array<Relationship>;

  /**
   *  Relationship buttons. Rel graph, Dependency graph, etc
   */
  relationshipButtons: Array<any>;
}

type States = {
  /**
   *  Relationships array
   */
  relationships: Array<Relationship>,

  /**
   *  Relationship type selected in Add form
   */
  reqRelTyp: RelationshipTypeEnum,

  /**
   *  Relationship dest ids entered in Add form
   */
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

  getLocalizedString(text: string) {
    const index = this.props.localizedStrings.findIndex(x => x.name === text);
    if (!index) return undefined;
    return this.props.localizedStrings[index].localized;
  }

  getConfigValue(option: string) {
    const index = this.props.configs.findIndex(x => x.option === option);
    if (!index) return undefined;
    return this.props.configs[index].value;
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
    const { canUpdate, relationshipButtons } = this.props;
    return relationships.length ? (
      <React.Fragment>
        <div className='widget-toolbox padding-8 clearfix'>
          {Object.entries(relationshipButtons).length && (
            <div className='btn-group pull-right noprint'>
              {Object.entries(relationshipButtons).map(([key, value]) => (
                <a className='btn btn-primary btn-white btn-round btn-sm' href={value}>{key}</a>
              ))}
            </div>
          )}
          {canUpdate && <div className='form-inline noprint'>
            <label className='inline'>{this.getLocalizedString('this_bug')}&nbsp;&nbsp;</label>
            <select
              className='input-sm'
              name='rel_type'
              onChange={(e) => this.setState({ reqRelTyp: parseInt(e.target.value) })}
              value={reqRelTyp}
            >
              <option value={RelationshipTypeEnum.PARENT_OF}>{this.getLocalizedString('dependant_on')}</option>
              <option value={RelationshipTypeEnum.CHILD_OF}>{this.getLocalizedString('blocks')}</option>
              <option value={RelationshipTypeEnum.DUPLICATE_OF}>{this.getLocalizedString('duplicate_of')}</option>
              <option value={RelationshipTypeEnum.HAS_DUPLICATE}>{this.getLocalizedString('has_duplicate')}</option>
              <option value={RelationshipTypeEnum.RELATED_TO}>{this.getLocalizedString('related_to')}</option>
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
            >
              {this.getLocalizedString('add_new_relationship_button')}
            </button>
          </div>}
        </div>
        <div className='widget-main no-padding'>
          <div className='table-responsive'>
            <table className='table table-bordered table-condensed table-hover'>
              <tbody>
                {relationships.map((relationship: Relationship, key: number) => (
                  <tr key={key}>
                    <td>
                      <span className='nowrap'>{relationship.type.label}</span>
                    </td>
                    <td>
                      <a href={`view.php?id=${relationship.issue.id}`}>
                        {'0'.repeat(Math.max(this.getConfigValue('display_bug_padding') - relationship.issue.id.toString().length, 0)) + relationship.issue.id}
                      </a>
                    </td>
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
              </tbody>
            </table>
          </div>
        </div>
      </React.Fragment>
    ) : null
  }
}
