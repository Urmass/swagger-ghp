# Swagger gh-pages generator

This repo is a template for creating similar repositories for projects inside of Edenlab team.

## Usage

Copy content of this repo to real project documentation repo.
The swagger file must be called `swagger.yml`.
You need to create empty gh-pages brunch and opt-in gh-pages in repository settings.

Github actions will automatically bump versions of `swagger.yml` and `package.json`.
* Based on the commit messages, increment the version from the latest release.
 * If the string "BREAKING CHANGE" is found anywhere in any of the commit messages or descriptions the major version will be incremented.
 * If a commit message begins with the string "feat" then the minor version will be increased. This works for most common commit metadata for feature additions: `"feat: new API"` and `"feature: new API"`.
 * All other changes will increment the patch version.

Github actions will automatically publish the latest version and redirect it from `/`.
All previous versions will be available by direct link. 

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
