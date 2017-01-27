/**
 * External Dependencies
 */
import { compact, startsWith } from 'lodash';
import debugFactory from 'debug';
import React from 'react';

/**
 * Internal Dependencies
 */
import SingleSiteComponent from 'my-sites/themes/single-site';
import MultiSiteComponent from 'my-sites/themes/multi-site';
import LoggedOutComponent from './logged-out';
import Upload from 'my-sites/themes/theme-upload';
import trackScrollPage from 'lib/track-scroll-page';
import { DEFAULT_THEME_QUERY } from 'state/themes/constants';
import { requestThemes, setBackPath } from 'state/themes/actions';
import { getThemesForQuery } from 'state/themes/selectors';
import { getAnalyticsData } from './helpers';

const debug = debugFactory( 'calypso:themes' );

function getProps( context ) {
	const { tier, filter, vertical, site_id: siteId } = context.params;

	const { basePath, analyticsPageTitle } = getAnalyticsData(
		context.path,
		tier,
		siteId
	);

	const boundTrackScrollPage = function() {
		trackScrollPage(
			basePath,
			analyticsPageTitle,
			'Themes'
		);
	};

	return {
		tier,
		filter,
		vertical,
		analyticsPageTitle,
		analyticsPath: basePath,
		search: context.query.s,
		trackScrollPage: boundTrackScrollPage
	};
}

export function upload( context, next ) {
	// Store previous path to return to only if it was main showcase page
	if ( startsWith( context.prevPath, '/design' ) &&
		! startsWith( context.prevPath, '/design/upload' ) ) {
		context.store.dispatch( setBackPath( context.prevPath ) );
	}

	context.primary = <Upload />;
	next();
}

export function singleSite( context, next ) {
	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <SingleSiteComponent { ...getProps( context ) } />;
	next();
}

export function multiSite( context, next ) {
	const props = getProps( context );

	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <MultiSiteComponent { ...props } />;
	next();
}

export function loggedOut( context, next ) {
	const props = getProps( context );

	context.primary = <LoggedOutComponent { ...props } />;
	next();
}

export function fetchThemeData( context, next, shouldUseCache = false ) {
	if ( ! context.isServerSide ) {
		return next();
	}

	const siteId = 'wpcom';
	const query = {
		search: context.query.s,
		tier: context.params.tier,
		filter: compact( [ context.params.filter, context.params.vertical ] ).join( ',' ),
		page: 1,
		number: DEFAULT_THEME_QUERY.number,
	};

	if ( shouldUseCache ) {
		const themes = getThemesForQuery( context.store.getState(), siteId, query );
		if ( themes ) {
			debug( 'found theme data in cache' );
			return next();
		}
	}

	context.store.dispatch( requestThemes( siteId, query ) )
		.then( () => {
			next();
		} );
}

export function fetchThemeDataWithCaching( context, next ) {
	if ( Object.keys( context.query ).length > 0 ) {
		// Don't cache URLs with query params for now
		return fetchThemeData( context, next, false );
	}

	return fetchThemeData( context, next, true );
}
