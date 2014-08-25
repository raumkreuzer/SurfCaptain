<?php
namespace Lightwerk\SurfCaptain\Command;

/*                                                                        *
 * This script belongs to the TYPO3 Flow package "Lightwerk.SurfCaptain". *
 *                                                                        *
 *                                                                        */

use TYPO3\Flow\Annotations as Flow;

class ApiCommandController extends BrowserCommandController {

	/**
	 * @var array
	 */
	protected $urls = array(
		'/api/repository',
		'/api/repository?repositoryUrl=git%40git.lightwerk.com%3Aproject%2Fgtweb.git',
		'/api/preset',
		'/api/preset?key=test_af',
		'/api/preset?key=sma',
		'/api/preset?key=foo',
		'/api/deployment',
		'/api/frontendsetting',
	);

	/**
	 * @throws \Lightwerk\SurfCaptain\Exception
	 * @return string
	 */
	protected function getUrlPrefix() {
		if (isset($_SERVER['HTTP_HOST']) === FALSE) {
			throw new \Lightwerk\SurfCaptain\Exception('env HTTP_HOST is not set', 1408983560);
		}
		return 'http://' . $_SERVER['HTTP_HOST'];
	}



}
