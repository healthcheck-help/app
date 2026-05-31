# Project

Name: healthcheck.help
Slogan: How to ask your containers: "You good?"
Description: It's a simple website that helps you to define the right HEALTHCHECK for you containers. Furthermore it informs you how to apply HEALTHCHECKS in different scenarios.
Motivation: Many images don't have a HEALTHCHECK defined and many people don't know how to define a HEALTHCHECK for their own images. Sometimes it's not easy to find the right HEALTHCHECK for your use case. healthcheck.help helps you to find the right HEALTHCHECK for your use case and informs you how to apply HEALTHCHECKS in different scenarios.

## Architecture

The project consists of two repositories:

- [app](https://codeberg.org/healthcheck/app): The main application, a SvelteKit app that provides the user interface and the logic to manage health checks.
- [data](https://codeberg.org/healthcheck/data): A collection of health check definitions and related data, which is used by the app to provide recommendations and information. (This repository is available under .llm/data for agentic work.)

HEALTHCHECKs are defined in the data repository as individual JSON files inside the following folder structure:

- Registry (e.g. `docker.io`)
  - Namespace (e.g. `library`)
    - Image (e.g. `nginx`)
      - Tag (e.g. `latest`) and `default.json`

JSON files contain the definition of a HEALTHCHECK according to the [docker compose specification](https://github.com/compose-spec/compose-spec/blob/8c28d854433e6efe224f3d1c288b3ab5d873402d/schema/compose-spec.json#L921-L959).

The core app should have a local clone of the data repository and manage the HEALTHCHECK definitions by creating branches, committing changes, and creating pull requests to merge changes into the main branch of the data repository. If the data repository is updated (e.g. a pull request is merged), the app should pull the latest changes to keep the local clone up to date. The notification happens via a webhook that the data repository sends to the app when a pull request is merged.

## Flows

This section describes the main flows of the application.

### Define a HEALTHCHECK

1. The user visits the website.
2. The user authenticates.
3. The user searches by an image (e.g. `nginx` which becomes `docker.io/library/nginx`).
4. The app shows the user results for the image, including existing HEALTHCHECKS.
5. The user chooses to add or edit a HEALTHCHECK.
6. The user fills out the form to define a HEALTHCHECK.
7. The app validates the input and provides feedback.
8. The user submits the form.
9. The app creates a new branch, commits the new or updated HEALTHCHECK to the branch, and creates a pull request to merge the changes into the main branch of the data repository.
10. The user can track the pull request and see when it gets merged.

### Explore HEALTHCHECKS

1. The user visits the website.
2. The user searches by an image (e.g. `nginx` which becomes `docker.io/library/nginx`).
3. The app shows the user results for the image, including existing HEALTHCHECKS.
4. The user can explore the existing HEALTHCHECKS, see details, and learn how to apply them in different scenarios.
