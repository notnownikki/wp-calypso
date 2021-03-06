/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import middleware from '../middleware';
import { HAPPYCHAT_RECEIVE_EVENT } from 'state/action-types';

describe( 'Audio Middleware', () => {
	let next;
	let store;
	let play;
	let _window; // Keep a copy of the original window if any

	beforeEach( () => {
		next = spy();

		store = {
			dispatch: spy(),
		};

		// Spy on (new Audio()).play()
		play = spy();
		_window = global.window;
		global.window = {
			Audio: spy( function() {
				return { play };
			} ),
		};
	} );

	afterEach( () => {
		global.window = _window;
	} );

	it( 'should pass along actions without corresponding handlers', () => {
		const action = { type: 'UNSUPPORTED_ACTION' };

		middleware( store )( next )( action );

		expect( store.dispatch ).to.not.have.beenCalled;
		expect( next ).to.have.been.calledWith( action );
	} );

	it( 'should not play any sound when no audio support', () => {
		const action = {
			type: HAPPYCHAT_RECEIVE_EVENT,
			event: {
				source: 'operator',
			},
		};

		global.window = {};

		middleware( store )( next )( action );

		expect( store.dispatch ).to.not.have.beenCalled;
		expect( next ).to.have.been.calledWith( action );
		expect( play ).to.not.have.beenCalled;
	} );

	it( 'should play sound when receiving a new message from the operator', () => {
		const action = {
			type: HAPPYCHAT_RECEIVE_EVENT,
			event: {
				source: 'operator',
			},
		};

		middleware( store )( next )( action );

		expect( store.dispatch ).to.not.have.beenCalled;
		expect( next ).to.have.been.calledWith( action );
		expect( window.Audio ).to.have.been.calledWith( '/calypso/audio/chat-pling.wav' );
		expect( play ).to.have.been.calledWith();
	} );
} );
