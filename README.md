# Resource Lock Manager

A TypeScript library and API for managing resource locks and detecting collisions on shared resources. This project allows users to track when resources are "locked" and provides functionalities to check for overlaps in lock periods.

## Features

- Check if a resource is "locked" or "free" at a specific point in time.
- Identify collisions for a given resource at a specific time.
- Retrieve all collision intervals for a specific resource.
- Persistent storage with SQLite and Knex.js.
- Input validation using class-validator.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Linting and Formatting](#linting-and-formatting)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/resource-lock-manager.git
   cd resource-lock-manager


## Setup

```bash

# use the project node version
nvm use
# Install dependencies
npm install

# run tests
npm run test

# run service dev
npm run dev  
# or 
npm run build
npm run start

# To check for linting issues, run:
npm run lint


#To format your code, run:
npm run prettify


```

## API Endpoints

POST /api/resources/lock: add resource.

POST /api/resources/bulkLocks: add resources in bulk.

GET /api/resources: get all locks of resource.

GET /api/resources/isLocked: check if resource is locked in specific time.

GET /api/resources/isCollision: check if resource in collision in specific time.

GET /api/resources/collisions: find collisions in resource.

GET /api/resources/collision: find first collisions in resource.

GET /is_alive: Server health check.