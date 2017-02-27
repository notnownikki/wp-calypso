/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { initial, flatMap, trim, debounce } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import Stream from 'reader/stream';
import EmptyContent from './empty';
import HeaderBack from 'reader/header-back';
import SearchInput from 'components/search';
import SuggestionProvider from './suggestion-provider';
import Suggestion from './suggestion';
import { RelatedPostCard } from 'blocks/reader-related-card-v2';
import { SEARCH_RESULTS, } from 'reader/follow-button/follow-sources';

class SearchStream extends Component {

	static propTypes = {
		query: React.PropTypes.string,
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.query !== this.props.query ) {
			this.updateState( nextProps );
		}
	}

	updateState = ( props = this.props ) => {
		const newState = {
			title: this.getTitle( props )
		};
		if ( newState.title !== this.state.title ) {
			this.setState( newState );
		}
	}

	getTitle = ( props = this.props ) => {
		return props.query;
	}

	state = {
		title: this.getTitle()
	}

	updateQuery = ( newValue ) => {
		this.scrollToTop();
		const trimmedValue = trim( newValue ).substring( 0, 1024 );
		if ( ( trimmedValue !== '' &&
				trimmedValue.length > 1 &&
				trimmedValue !== this.props.query
			) ||
			newValue === ''
		) {
			this.props.onQueryChange( newValue );
		}
	}

	scrollToTop = () => {
		window.scrollTo( 0, 0 );
	}

	handleStreamMounted = ( ref ) => {
		this.streamRef = ref;
	}

	handleSearchBoxMounted = ( ref ) => {
		this.searchBoxRef = ref;
	}

	resizeSearchBox = () => {
		if ( this.searchBoxRef && this.streamRef ) {
			const width = this.streamRef.getClientRects()[ 0 ].width;
			if ( width > 0 ) {
				this.searchBoxRef.style.width = `${ width }px`;
			}
		}
	}

	componentDidMount() {
		this.resizeListener = window.addEventListener( 'resize', debounce( this.resizeSearchBox, 50 ) );
		this.resizeSearchBox();
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resizeListener );
	}

	placeholderFactory = ( { key, ...rest } ) => {
		if ( ! this.props.query ) {
			return (
				<div className="search-stream__recommendation-list-item" key={ key }>
					<RelatedPostCard { ...rest } />
				</div>
			);
		}
		return null;
	}

	render() {
		const { query, suggestions } = this.props;
		const emptyContent = <EmptyContent query={ query } />;

		let searchPlaceholderText = this.props.searchPlaceholderText;
		if ( ! searchPlaceholderText ) {
			searchPlaceholderText = this.props.translate( 'Search billions of WordPress.com posts…' );
		}

		const suggestionList = initial( flatMap( suggestions, suggestionKeyword =>
			[ <Suggestion suggestion={ suggestionKeyword } source="search" />, ', ' ] ) );

		const documentTitle = this.props.translate(
			'%s ‹ Reader', { args: this.state.title || this.props.translate( 'Search' ) }
		);
		return (
			<Stream
				{ ...this.props }
				followSource={ SEARCH_RESULTS }
				listName={ this.props.translate( 'Search' ) }
				emptyContent={ emptyContent }
				showFollowInHeader={ true }
				placeholderFactory={ this.placeholderFactory }
				className="search-stream" >
				{ this.props.showBack && <HeaderBack /> }
				<DocumentHead title={ documentTitle } />
				<div ref={ this.handleStreamMounted } />
				<div className="search-stream__fixed-area" ref={ this.handleSearchBoxMounted }>
					<CompactCard className="search-stream__input-card">
						<SearchInput
							initialValue={ query }
							onSearch={ this.updateQuery }
							onSearchClose={ this.scrollToTop }
							autoFocus={ this.props.autoFocusInput }
							delaySearch={ true }
							delayTimeout={ 500 }
							placeholder={ searchPlaceholderText } />
					</CompactCard>
					<p className="search-stream__blank-suggestions">
						{ suggestions &&
							this.props.translate(
								'Suggestions: {{suggestions /}}.', {
									components: {
										suggestions: suggestionList
									}
								} )
						}&nbsp;
					</p>

					<hr className="search-stream__fixed-area-separator" />
				</div>
			</Stream>
		);
	}
}

export default SuggestionProvider( localize( SearchStream ) );
