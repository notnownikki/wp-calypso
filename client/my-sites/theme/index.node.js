import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import { makeLayout } from 'controller';
import { details, fetchThemeDetailsData } from './controller';

export default function( router ) {
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		router( '/theme/:slug/:section(setup|support)?/:site_id?', fetchThemeDetailsData, details, makeLayout );
		// TODO: Add adapter; Make sure client works this way, too. Essentially, we want to bail if not found so the server-rendered stuff is used.
		// And just not render?
		// Maybe move to separate PR? (before caching one)
		router( ( err, context, next ) => {
		//router( ( err, req, res, next ) => {
			// We need to specify 4 arguments here (including next, although unused) to indicate this is an error handling mw
			//res.status( 404 );
			// create error in context.primary. That's req.primary, right?
			context.layout = <div>dulioe</div>;
			next();
			// Or do we rely on render?
		} );
	}
}
