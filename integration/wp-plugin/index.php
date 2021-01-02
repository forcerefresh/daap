<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://www.webslider.io
 * @since             1.0.0
 * @package           WebSlider
 *
 * @wordpress-plugin
 * Plugin Name:       webslider
 * Plugin URI:        https://www.webslider.io
 * Description:       This is a short description of what the plugin does. It's displayed in the WordPress admin area.
 * Version:           1.0.0
 * Author:            WebSlider d.o.o.
 * Author URI:        https://www.webslider.io
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       webslider
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'WEB_SLIDER_VERSION', '1.0.0' );

function addPageContentHandler() {

	echo '<div id="WebSlider-RootContainer" class="WebSlider-RootContainer"></div>';

	echo '<style>#wpcontent{padding-left: 0px;} body{background: #1e1e1e;}</style>';
	echo '<input id="upload_image" type="text" size="36" name="upload_image" value="" style="" />';
	echo '<img src="sd" width="100" height="100" class="thickbox"/>';
	
}

function addMenu() {
	add_media_page('Web Slider', 'Web Slider', 'upload_files', 'awssoft-magic-edge', 'addPageContentHandler');
}

function run_webslider() {
	add_action('admin_menu', 'addMenu');
  add_action('admin_init', 'enqueueJSCSS');
}

function include_thickbox_scripts() {
    wp_enqueue_script('thickbox', null, array('jquery'));
    wp_enqueue_style('thickbox.css', '/'.WPINC.'/js/thickbox/thickbox.css', null, '1.0');
}

add_action('wp_enqueue_scripts', 'include_thickbox_scripts');

function enqueueJSCSS() {
	include_thickbox_scripts();
	wp_enqueue_script('media-upload');
	wp_enqueue_media();
}

run_webslider(); 



/** *********** LOAD FILER FROM WEBPACK DEV SERVER ***********  */

// Setting hook to load files.
add_action('admin_enqueue_scripts','rp_load_react_app');

/**
 * Load react app files in WordPress admin.
 *
 * @return bool|void
 */
function rp_load_react_app($hook) {

	$is_main_dashboard = $hook === 'index.php';

	// Only load react app scripts in main admin page.
	//if( !$is_main_dashboard)
		//return;

	// Setting path variables.
	// $plugin_app_dir_url =plugin_dir_url( __FILE__ ) . 'react-app/';
	// $react_app_build = $plugin_app_dir_url .'build/';
	$react_app_build = "http://localhost:3000/";
	$manifest_url = $react_app_build. 'asset-manifest.json';

	// Request manifest file.
	$request = file_get_contents( $manifest_url );

	// If the remote request fails, wp_remote_get() will return a WP_Error, so let’s check if the $request variable is an error:
	if( !$request )
		return false;

	// Convert json to php array.
	$files_data = json_decode($request);
	if($files_data === null)
		return ;

	if(!property_exists($files_data,'entrypoints'))
		return false;

	// Get assets links.
	$assets_files = $files_data->entrypoints;

	$js_files = array_filter($assets_files,'rp_filter_js_files');
	$css_files = array_filter($assets_files,'rp_filter_css_files');

	// Load css files.
	foreach ($css_files as $index => $css_file){
		wp_enqueue_style('react-plugin-'.$index, $react_app_build . $css_file);
	}

	// Load js files.
	foreach ($js_files as $index => $js_file){
		wp_enqueue_script('react-plugin-'.$index, $react_app_build . $js_file, array(), 1, true);
	}

	// Variables for app use.
	wp_localize_script('react-plugin-0', 'rpReactPlugin',
		array('appSelector' => '#wpbody .wrap')
	);
}

/**
 * Get js files from assets array.
 *
 * @param array $file_string
 *
 * @return bool
 */
function rp_filter_js_files ($file_string){
  return pathinfo($file_string, PATHINFO_EXTENSION) === 'js';
}

/**
 * Get css files from assets array.
 *
 * @param array $file_string
 *
 * @return bool
 */
function rp_filter_css_files ($file_string) {
	return pathinfo( $file_string, PATHINFO_EXTENSION ) === 'css';
}
