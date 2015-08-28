'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var remote = require('remote');
var dialog = remote.require('dialog');

var fileSystem = require('./js/file-system');
var constants = require('./js/constants');

// jquery selectors
var $currentImage = $('#currentImage'),
	$previous = $('#previous'),
	$next = $('#next'),
	$directoryStats = $('#directoryStats'),
	$openFile = $('#open-file');

// the list of all retrieved files
var imageFiles = [];

// Shows an image on the page.
var showImage = function(index) {
	$openFile.hide(); // a file is selected already.

	$currentImage.data('currentIndex', index);
	$currentImage.attr('src', imageFiles[index]);

	// Hide show previous/next if there are no more/less files.
	$next.toggle(!(index + 1 === imageFiles.length));
	$previous.toggle(!(index === 0));

	// set the stats text
	var statsText = (index + 1) + ' / ' + imageFiles.length;
	$directoryStats.text(statsText);
};

$previous.click(function() {
	var currentImageId = $currentImage.data('currentIndex');
	if(currentImageId > 0) {
		showImage(--currentImageId);
	}
});

$next.click(function() {
	var currentImageId = $currentImage.data('currentIndex');
	if(currentImageId + 1 < imageFiles.length) {
		showImage(++currentImageId);
	}
});

var _loadDir = function(dir, fileName) {
	imageFiles = fileSystem.getDirectoryImageFiles(dir);

	var selectedImageIndex = imageFiles.indexOf(fileName);
	if(selectedImageIndex === -1) {
		selectedImageIndex = 0;
	}

	if(selectedImageIndex < imageFiles.length) {
		showImage(selectedImageIndex);	
	}
	else {
		alert('No image files found in this directory.');
	}
}

var onFileOpen = function(fileName) {
	fileName = fileName + ''; // convert to string.
	var dirName = path.dirname(fileName);

	_loadDir(dirName, fileName);
};

var onDirOpen = function(dir) {
	_loadDir(dir + ''); // convert to string
};

// Initialize the app
var initialize = function() {
	var appMenu = require('./js/app-menu'); 
	appMenu.initialize({
		onFileOpen: onFileOpen,
		onDirOpen: onDirOpen
	});

	// no files selected
	$openFile.show();

	$openFile.click(function() {
		// TODO: Refactor this... code duplication
		dialog.showOpenDialog({
			properties: [
				'openFile'
			],
			filters: [
				{
					name: 'Images',
					extensions: constants.SupportedImageExtensions	
				}
			]
		},
		function(fileName) {
			if(fileName && onFileOpen) {
				onFileOpen(fileName);
			}
		});
	});
};
initialize();
