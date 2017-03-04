/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getDirectlyStatus } from '../';

describe( 'getDirectlyStatus()', () => {
	it( 'should return the proper status', () => {
		const status = getDirectlyStatus( { help: { directly: { status: 'READY' } } } );
		expect( status ).to.eq( 'READY' );
	} );
} );
