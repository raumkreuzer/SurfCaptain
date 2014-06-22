<?php
namespace Lightwerk\SurfCaptain\Controller;

/*                                                                        *
 * This script belongs to the TYPO3 Flow package "Lightwerk.SurfCaptain". *
 *                                                                        *
 *                                                                        */

use TYPO3\Flow\Annotations as Flow;
use TYPO3\Flow\Mvc\Controller\RestController;

abstract class AbstractRestController extends RestController {

	/**
	 * @var string
	 * @see \TYPO3\Flow\Mvc\Controller\ActionController
	 */
	protected $defaultViewObjectName = 'TYPO3\\Flow\\Mvc\\View\\JsonView';

	/**
	 * A custom redirect, that does not set action, controller, package and format arguments
	 *
	 * @param integer $statusCode
	 * @return void
	 * @throws \TYPO3\Flow\Mvc\Exception\StopActionException
	 */
	protected function redirectToResource($statusCode = 303) {
		$httpRequest = $this->request->getHttpRequest();
		$uri = $httpRequest->getBaseUri() . 'api/' . strtolower($this->request->getControllerName());
		$this->response->setHeader('Location', $uri);
		$this->response->setStatus($statusCode);
		$this->response->setHeader('Accept', $this->request->getHttpRequest()->getHeaders()->get('HTTP_ACCEPT'));
		$this->response->setContent('');
		throw new \TYPO3\Flow\Mvc\Exception\StopActionException();
	}
}