#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Force install ALL dependencies (including devDependencies)
npm install

# 2. Run the TypeScript compiler to build the project
npm run build