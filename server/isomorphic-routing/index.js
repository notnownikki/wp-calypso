/**
 * Internal dependencies
 */
import { serverRender } from 'render';
import { setSection as setSectionMiddlewareFactory } from '../../client/controller';

export function serverRouter( expressApp, setUpRoute, section ) {
	return function( route, ...middlewares ) {
		if ( typeof route === 'function' && middlewares.length === 0 ) {
			// No route def -- the route arg is really a middleware
			//expressApp.use( route );
			expressApp.use( ( err, req, res, next ) => {
				route( req.context, next.bind( null, err ) );
			} ); //  Need err arg!
			expressApp.use( ( err, req, res, next ) => { // eslint-disable-line no-unused-vars
				//res.send( 'Theme 404' )
				serverRender( req, res );
			} );
		} else {
			expressApp.get(
				route,
				setUpRoute,
				combineMiddlewares(
					setSectionMiddlewareFactory( section ),
					...middlewares
				),
				serverRender
			);
		}
	};
}

function combineMiddlewares( ...middlewares ) {
	return function( req, res, next ) {
		req.context = getEnhancedContext( req );
		applyMiddlewares( req.context, next, ...middlewares, () => {
			next();
		} );
	};
}

// TODO: Maybe merge into getDefaultContext().
function getEnhancedContext( req ) {
	return Object.assign( {}, req.context, {
		isLoggedIn: req.cookies.wordpress_logged_in,
		isServerSide: true,
		path: req.url,
		pathname: req.path,
		params: req.params,
		query: req.query
	} );
}

function applyMiddlewares( context, expressNext, ...middlewares ) {
	const liftedMiddlewares = middlewares.map( middleware => next => middleware( context, ( err ) => {
		if ( err ) {
			expressNext( err ); // Call express' next( err ) for error handling (and bail early from this route)
		}
		next();
	} ) );
	compose( ...liftedMiddlewares )();
}

function compose( ...functions ) {
	return functions.reduceRight( ( composed, f ) => (
		() => f( composed )
	), () => {} );
}

// next => fetchDetails( context, next )
// next => details( context, next )
// next => makeLayout( context, next )
// next => (() => { expressNext(); }) ( context, next ) -- this just invokes the ()=> fn, and hence expresNext, doesn't it.

// compose: start with () => {}
// () => {}

// When next is called, we normally just call the next fn in line. but we really should check if it's called with an arg.
