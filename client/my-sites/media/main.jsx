/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import MediaLibrary from 'my-sites/media-library';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import observe from 'lib/mixins/data-observe';
import Dialog from 'components/dialog';
import { EditorMediaModalDetail } from 'post-editor/media-modal/detail';
import ImageEditor from 'blocks/image-editor';
import VideoEditor from 'blocks/video-editor';
import MediaActions from 'lib/media/actions';
import MediaUtils from 'lib/media/utils';

export default React.createClass( {
	displayName: 'Media',

	mixins: [ observe( 'sites' ) ],

	propTypes: {
		sites: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			editedImageItem: null,
			editedVideoItem: null,
			openedDetails: null,
		};
	},

	componentDidMount: function() {
		this.setState( {
			containerWidth: this.refs.container.clientWidth
		} );
	},

	onFilterChange: function( filter ) {
		let redirect = '/media';

		if ( filter ) {
			redirect += '/' + filter;
		}

		if ( this.props.sites.selected ) {
			redirect += '/' + this.props.sites.selected;
		}

		page( redirect );
	},

	openDetailsModal( item ) {
		this.setState( { openedDetails: item } );
	},

	closeDetailsModal() {
		this.setState( { openedDetails: null, editedImageItem: null, editedVideoItem: null } );
	},

	editImage() {
		this.setState( { openedDetails: null, editedImageItem: this.state.openedDetails } );
	},

	editVideo() {
		this.setState( { openedDetails: null, editedVideoItem: this.state.openedDetails } );
	},

	onImageEditorCancel: function( imageEditorProps ) {
		const {	resetAllImageEditorState } = imageEditorProps;
		this.setState( { openedDetails: this.state.editedImageItem, editedImageItem: null } );

		resetAllImageEditorState();
	},

	onImageEditorDone( error, blob, imageEditorProps ) {
		if ( error ) {
			this.onEditImageCancel( imageEditorProps );

			return;
		}

		const {
			fileName,
			site,
			ID,
			resetAllImageEditorState
		} = imageEditorProps;

		const mimeType = MediaUtils.getMimeType( fileName );

		const item = {
			ID: ID,
			media: {
				fileName: fileName,
				fileContents: blob,
				mimeType: mimeType
			}
		};

		MediaActions.update( site.ID, item, true );
		resetAllImageEditorState();
		this.setState( { openedDetails: null, editedImageItem: null } );
	},

	onVideoEditorCancel: function() {
		this.setState( { openedDetails: this.state.editedVideoItem, editedVideoItem: null } );
	},

	onVideoEditorUpdatePoster( { ID, poster } ) {
		const site = this.props.sites.getSelectedSite();

		if ( site ) {
			MediaActions.edit( site.ID, {
				ID,
				thumbnails: {
					fmt_hd: poster,
					fmt_dvd: poster,
					fmt_std: poster,
				}
			} );
		}

		this.setState( { openedDetails: null, editedVideoItem: null } );
	},

	restoreOriginalMedia: function( siteId, item ) {
		if ( ! siteId || ! item ) {
			return;
		}
		MediaActions.update( siteId, { ID: item.ID, media_url: item.guid }, true );
		this.setState( { openedDetails: null, editedImageItem: null } );
	},

	render: function() {
		const site = this.props.sites.getSelectedSite();
		return (
			<div ref="container" className="main main-column media" role="main">
				<SidebarNavigation />
				{ ( this.state.editedImageItem || this.state.editedVideoItem || this.state.openedDetails ) &&
					<Dialog
						isVisible={ true }
						additionalClassNames="editor-media-modal"
						onClose={ this.closeDetailsModal }
					>
					{ this.state.openedDetails &&
						<EditorMediaModalDetail
							site={ site }
							items={ [ this.state.openedDetails ] }
							selectedIndex={ 0 }
							onReturnToList={ this.closeDetailsModal }
							onEditImageItem={ this.editImage }
							onEditVideoItem={ this.editVideo }
							onRestoreItem={ this.restoreOriginalMedia }
						/>
					}
					{ this.state.editedImageItem &&
						<ImageEditor
							siteId={ site && site.ID }
							media={ this.state.editedImageItem }
							onDone={ this.onImageEditorDone }
							onCancel={ this.onImageEditorCancel }
						/>
					}
					{ this.state.editedVideoItem &&
						<VideoEditor
							media={ this.state.editedVideoItem }
							onCancel={ this.onVideoEditorCancel }
							onUpdatePoster={ this.onVideoEditorUpdatePoster }
						/>
					}
					</Dialog>
				}
				<MediaLibrary
					{ ...this.props }
					onFilterChange={ this.onFilterChange }
					site={ site || false }
					single={ true }
					onEditItem={ this.openDetailsModal }
					containerWidth={ this.state.containerWidth } />
			</div>
		);
	}
} );
