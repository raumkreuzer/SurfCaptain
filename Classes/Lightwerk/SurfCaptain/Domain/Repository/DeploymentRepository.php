<?php
namespace Lightwerk\SurfCaptain\Domain\Repository;

/*                                                                        *
 * This script belongs to the TYPO3 Flow package "Lightwerk.SurfCaptain". *
 *                                                                        *
 *                                                                        */

use TYPO3\Flow\Annotations as Flow;
use TYPO3\Flow\Persistence\QueryInterface;
use TYPO3\Flow\Persistence\Repository;

/**
 * @Flow\Scope("singleton")
 */
class DeploymentRepository extends Repository {

	/**
	 * @var array
	 * @see \TYPO3\Flow\Persistence\Repository
	 */
	protected $defaultOrderings = array(
		'date' => QueryInterface::ORDER_DESCENDING,
	);
}