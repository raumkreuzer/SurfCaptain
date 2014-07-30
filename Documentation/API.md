# API

## Repositories

### List Repositories

- Methode: GET
- Path: /api/repositories

Example call:

    curl http://surf.flow.lp.lw.loc/api/repositories | jq '.'

## Branches & Tags

### List branches of a repository

- Methode: GET
- Path: /api/branches
- Parameters:
	- repositoryUrl (required) - string

Example call:

    curl http://surf.flow.lp.lw.loc/api/branches\?repositoryUrl\=git%40git.lightwerk.com%3Aboilerplate%2Ftypo3_cms.git | jq '.'

### List tags of a repository

- Methode: GET
- Path: /api/tags
- Parameters:
	- repositoryUrl (required) - string

Example call:

    curl http://surf.flow.lp.lw.loc/api/tags\?repositoryUrl\=git%40git.lightwerk.com%3Aboilerplate%2Ftypo3_cms.git | jq '.'

## Deployments

### List deployments

- Methode: GET
- Path: /api/deployments
- Parameters:
	- repositoryUrl (optional) - string
	- limit (optional) - integer (Default: 10, All: 0)

Example call to get the last 10 deployments of all repositories:

    curl http://surf.flow.lp.lw.loc/api/deployments | jq '.'

Example call to get the last 30 deployments of git@git.lightwerk.com:boilerplate/typo3_cms.git:

    curl http://surf.flow.lp.lw.loc/api/deployments\?repositoryUrl\=git%40git.lightwerk.com%3Aboilerplate%2Ftypo3_cms.git\&limit\=30 | jq '.'

### Create new deployment

- Methode: POST
- Path: /api/deployments
- Parameters:
	- configuration (optional) - json
	- key (optional) - string (Gets the configuration from Presets.json)

Example call with a configuration:

    curl -v -X POST http://surf.flow.lp.lw.loc/api/deployments\?configuration\=%7B%22applications%22%3A%5B%7B%22type%22%3A%22TYPO3%5C%5CCMS%5C%5CDeploy%22%2C%22options%22%3A%7B%22repositoryUrl%22%3A%22git%40git.lightwerk.com%3Aboilerplate%5C%2Ftypo3_cms.git%22%2C%22documentRoot%22%3A%22%5C%2Fvar%5C%2Fwww%5C%2FprojectName%5C%2Fcontext%5C%2F%22%2C%22context%22%3A%22Development%22%2C%22tag%22%3A%221.2.3%22%7D%2C%22nodes%22%3A%5B%7B%22name%22%3A%22Front-End+Server+2%22%2C%22hostname%22%3A%22www2.sma.de%22%2C%22username%22%3A%22user2%22%7D%5D%7D%5D%7D

Example call with a key:

    curl -v -X POST http://surf.flow.lp.lw.loc/api/deployments\?key\=sma

Example of a decode configuration parameter:

     {
        "applications": [
            {
                "type": "TYPO3\\CMS\\Deploy",
                "options": {
                    "repositoryUrl": "git@git.lightwerk.com:boilerplate/typo3_cms.git",
                    "documentRoot": "/var/www/projectName/context/",
                    "context": "Development",
                    "tag": "1.2.3"
                },
                "nodes": [
                    {
                        "name": "Front-End Server 2",
                        "hostname": "www2.sma.de",
                        "username": "user2"
                    }
                ]
            }
        ]
    }

### Cancel a deployment

- Info: Works just if it has still "waiting" as status
- Methode: DELETE
- Path: /api/deployments
- Parameters:
	- deployment (required) - string

Example call:

    curl -v -X DELETE http://surf.flow.lp.lw.loc/api/deployments\?deployment\=ac964cbf-9f85-c9d3-63b8-85b40414f53c

## Logs

### List logs of a deployment

- Methode: GET
- Path: /api/logs
- Parameters:
	- deployment (required) - string
	- offset (optional) - integer (sum of already loaded log entries (to load them not again))

Example call:

    curl http://surf.flow.lp.lw.loc/api/logs\?deployment\=ac964cbf-9f85-c9d3-63b8-85b40414f53c | jq '.'

Example call with a offset of 23:

    curl http://surf.flow.lp.lw.loc/api/logs\?deployment\=ac964cbf-9f85-c9d3-63b8-85b40414f53c\&offset=23 | jq '.'

## Presets

### List presets

- Methode: GET
- Path: /api/presets
- Parameters:
	- repositoryUrl (required) - string
	- type (optional) - string (type= to get presets without a type)

Example call to list presets of a defined project:

    curl http://surf.flow.lp.lw.loc/api/presets\?repositoryUrl\=git%40git.lightwerk.com%3Aboilerplate%2Ftypo3_cms.git | jq '.'

Example call to list presets without a defined project (Wildcards for developer instances):

    curl http://surf.flow.lp.lw.loc/api/presets\?repositoryUrl\= | jq '.'

### Add presets

- Methode: POST
- Path: /api/presets
- Parameters:
	- configuration (required) - json

Example call:

    curl -v -X POST http://surf.flow.lp.lw.loc/api/presets\?configuration\=%7B%22sma%22%3A%7B%22applications%22%3A%5B%7B%22options%22%3A%7B%22repositoryUrl%22%3A%22git%40git.lightwerk.com%3Aboilerplate%5C%2Ftypo3_cms.git%22%2C%22documentRoot%22%3A%22%5C%2Fvar%5C%2Fwww%5C%2FprojectName%5C%2Fcontext%5C%2F%22%2C%22context%22%3A%22Development%22%7D%2C%22nodes%22%3A%5B%7B%22name%22%3A%22Front-End+Server+2%22%2C%22hostname%22%3A%22www2.sma.de%22%2C%22username%22%3A%22user2%22%7D%5D%7D%5D%7D%7D

Example of a decoded configuration parameter:

    {
        "sma": {
            "applications": [
                {
                    "options": {
                        "repositoryUrl": "git@git.lightwerk.com:boilerplate/typo3_cms.git",
                        "documentRoot": "/var/www/projectName/context/",
                        "context": "Development"
                    },
                    "nodes": [
                        {
                            "name": "Front-End Server 2",
                            "hostname": "www2.sma.de",
                            "username": "user2"
                        }
                    ]
                }
            ]
        }
    }

### Update presets

- Methode: PUT
- Path: /api/presets
- Parameters:
	- configuration (required) - json
- Info: To rename a key, please delete the old preset and add a new one

Example call:

    curl -v -X PUT http://surf.flow.lp.lw.loc/api/presets\?configuration\=%7B%22sma%22%3A%7B%22applications%22%3A%5B%7B%22options%22%3A%7B%22repositoryUrl%22%3A%22git%40git.lightwerk.com%3Aboilerplate%5C%2Ftypo3_cms.git%22%2C%22documentRoot%22%3A%22%5C%2Fvar%5C%2Fwww%5C%2FprojectName%5C%2Fcontext%5C%2F%22%2C%22context%22%3A%22Development%22%7D%2C%22nodes%22%3A%5B%7B%22name%22%3A%22Front-End+Server+2%22%2C%22hostname%22%3A%22www2.sma.de%22%2C%22username%22%3A%22user2%22%7D%5D%7D%5D%7D%7D

### Delete preset

- Methode: DELETE
- Path: /api/presets
- Parameters:
	- key (required) - string

Example call:

    curl -v -X DELETE http://surf.flow.lp.lw.loc/api/presets\?key\=sma