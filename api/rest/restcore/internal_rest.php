<?php
# MantisBT - A PHP based bugtracking system

# MantisBT is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 2 of the License, or
# (at your option) any later version.
#
# MantisBT is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with MantisBT.  If not, see <http://www.gnu.org/licenses/>.

/**
 * A webservice interface to Mantis Bug Tracker
 *
 * @package MantisBT
 * @copyright Copyright MantisBT Team - mantisbt-dev@lists.sourceforge.net
 * @link http://www.mantisbt.org
 */

require_api( 'helper_api.php' );

/**
 * WARNING: All APIs under the internal route are considered private and can break anytime.
 */
$g_app->group('/internal', function() use ( $g_app ) {
	$g_app->any( '/autocomplete', 'rest_internal_autocomplete' );
	$g_app->any( '/config_display', 'rest_internal_config_display' );
	$g_app->get( '/issues/{id}/basic', 'rest_internal_issue_basic' );
	$g_app->get( '/issues/{id}/mention_candidates', 'rest_internal_issue_mention_candidates' );
});

/**
 * A method that gets the auto-complete result for given field and prefix.
 *
 * @param \Slim\Http\Request $p_request   The request.
 * @param \Slim\Http\Response $p_response The response.
 * @param array $p_args Arguments
 * @return \Slim\Http\Response The augmented response.
 */
function rest_internal_autocomplete( \Slim\Http\Request $p_request, \Slim\Http\Response $p_response, array $p_args ) {
	$t_field = $p_request->getParam( 'field' );
	$t_prefix = $p_request->getParam( 'prefix' );

	switch( $t_field ) {
		case 'platform':
			$t_unique_entries = profile_get_field_all_for_user( 'platform' );
			$t_matches = helper_filter_by_prefix( $t_unique_entries, $t_prefix );
			break;
		case 'os':
			$t_unique_entries = profile_get_field_all_for_user( 'os' );
			$t_matches = helper_filter_by_prefix( $t_unique_entries, $t_prefix );
			break;
		case 'os_build':
			$t_unique_entries = profile_get_field_all_for_user( 'os_build' );
			$t_matches = helper_filter_by_prefix( $t_unique_entries, $t_prefix );
			break;
		case 'related_issue_id':
			$t_unique_entries = last_visited_get_array();
			$t_matches = helper_filter_by_prefix( $t_unique_entries, $t_prefix );
			break;
		default:
			return $p_response->withStatus( HTTP_STATUS_NOT_FOUND, "Field '$t_field' doesn't have auto-complete." );
	}

	return $p_response->withStatus( HTTP_STATUS_SUCCESS )->withJson( $t_matches );
}

function rest_internal_config_display( \Slim\Http\Request $p_request, \Slim\Http\Response $p_response, array $p_args ) {
	$t_config_id = $p_request->getParam( 'config_id' );
	$t_user_id = $p_request->getParam( 'user_id' );
	$t_project_id = $p_request->getParam( 'project_id' );

	if( !access_has_global_level( config_get( 'view_configuration_threshold' ), auth_get_current_user_id() ) ) {
		return $p_response->withStatus( HTTP_STATUS_FORBIDDEN );
	}
	if( null === $t_user_id || null === $t_project_id || null === $t_config_id ) {
		$t_message = "Missing parameters";
		return $p_response->withStatus( HTTP_STATUS_BAD_REQUEST, $t_message );
	}

	$t_sql = 'SELECT config_id, user_id, project_id, type, value, access_reqd FROM {config}'
			. ' WHERE user_id = :user_id AND project_id = :project_id AND config_id = :config_id';
	$t_params = array(
		'user_id' => $t_user_id,
		'project_id' => $t_project_id,
		'config_id' => $t_config_id
		);
	$t_query = new DbQuery( $t_sql, $t_params );
	$t_row = $t_query->fetch();

	if( !$t_row ) {
		$t_message = "Requested option/project/user doesn't exist";
		return $p_response->withStatus( HTTP_STATUS_NOT_FOUND, $t_message );
	}

	$t_output = config_get_value_as_string( $t_row['type'], $t_row['value'], true );

	return $p_response->withStatus( HTTP_STATUS_SUCCESS )->write( $t_output );
}

function rest_internal_issue_basic( \Slim\Http\Request $p_request, \Slim\Http\Response $p_response, array $p_args ) {
	$t_issue_id = $p_args['id'];

	$t_issue = array();
	$t_lang = lang_get_current();

	if( !empty( $t_issue_id ) && bug_exists( $t_issue_id ) && access_has_bug_level( VIEWER, $t_issue_id ) ) {
		$t_issue['title'] = bug_get_field( $t_issue_id, 'summary' );
		$t_issue['status'] = mci_enum_get_array_by_id( bug_get_field( $t_issue_id, 'status' ), 'status', $t_lang );
	}

	$t_result = array( 'issue' => $t_issue );

	return $p_response->withStatus( HTTP_STATUS_SUCCESS )->withJson( $t_result );
}

function rest_internal_issue_mention_candidates( \Slim\Http\Request $p_request, \Slim\Http\Response $p_response, array $p_args ) {
	$t_issue_id = isset( $p_args['id'] ) ? (int)$p_args['id'] : '';

	$t_users = array();

	$t_user_id = auth_get_current_user_id();
	if( !empty( $t_issue_id ) && bug_exists( $t_issue_id ) && access_has_bug_level( VIEWER, $t_issue_id, $t_user_id ) ) {
		$t_issue_data = bug_get( $t_issue_id, true );
		$t_lang = mci_get_user_lang( $t_user_id );
		$t_issue = mci_issue_data_as_array( $t_issue_data, $t_user_id, $t_lang );

		# reporter and handler
		$t_users[$t_issue['reporter']['id']] = $t_issue['reporter'];
		if( isset( $t_issue['handler'] ) ) {
			$t_users[$t_issue['handler']['id']] = $t_issue['handler'];
		}

		# note authors
		if( isset( $t_issue['notes'] ) ) {
			foreach( $t_issue['notes'] as $t_note ) {
				$t_users[$t_note['reporter']['id']] = $t_note['reporter'];
			}
		}

		# users who monitor the issue
		if( $t_issue['monitors'] ) {
			foreach( $t_issue['monitors'] as $t_user ) {
				$t_users[$t_user['id']] = $t_user;
			}
		}

		# users who acted on the issue
		if( $t_issue['history'] ) {
			foreach ( $t_issue['history'] as $t_event ) {
				$t_users[$t_event['user']['id']] = $t_event['user'];
			}
		}

		# If current user can handle issues, then bring in peer group for this project.
		$t_project_id = $t_issue_data->project_id;
		$t_handle_bug_threshold = config_get( 'handle_bug_threshold', null, null, $t_project_id );

		# If handle bug threshold is set to DEVELOPER and MANAGER as an array, then administrator won't see such users.
		# Hence, adding a check for administrator explicitly.
		if( current_user_is_administrator() ||
		    access_has_bug_level( $t_handle_bug_threshold, $t_issue_id, $t_user_id ) ) {
			$t_project_handlers_ids = project_user_list_with_access_level_temp( $t_project_id, $t_handle_bug_threshold );
			foreach( $t_project_handlers_ids as $t_handler_id ) {
				$t_users[$t_handler_id] = mci_account_get_array_by_id( $t_handler_id );
			}
		}

		# remove current user
		unset( $t_users[$t_user_id] );

		$t_users = array_values( $t_users );
	}

	$t_result = array( 'users' => $t_users );

	return $p_response->withStatus( HTTP_STATUS_SUCCESS )->withJson( $t_result );
}

/**
 * Get list of users in specified project with access level specified or above.
 *
 * @todo from print_reporter_option_list
 * @param integer       $p_project_id A project identifier.
 * @param integer       $p_access     An access level.
 * @return array of users with id, username, realname, access_level
 * 
 * TODO: copied from print_user_option_list() - needs to refactor MantisBT to separate business logic from view.
 *       This version returns the users in a format that maps the REST API format, compared to original version
 *       that used internal format.
 */
function project_user_list_with_access_level_temp( $p_project_id = null, $p_access = ANYBODY ) {
	$t_current_user = auth_get_current_user_id();

	if( null === $p_project_id ) {
		$p_project_id = helper_get_current_project();
	}

	if( $p_project_id === ALL_PROJECTS ) {
		$t_projects = user_get_accessible_projects( $t_current_user );
	} else {
		$t_projects = array( $p_project_id );
	}

	# Get list of users having access level for all accessible projects
	$t_users = array();
	foreach( $t_projects as $t_project_id ) {
		$t_project_users_list = project_get_all_user_rows( $t_project_id, $p_access );

		# Do a 'smart' merge of the project's user list, into an
		# associative array (to remove duplicates)
		foreach( $t_project_users_list as $t_id => $t_user ) {
			$t_users[$t_id] = $t_id;
		}

		# Clear the array to release memory
		unset( $t_project_users_list );
	}

	return $t_users;
}
