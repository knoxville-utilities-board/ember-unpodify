# ember-unpodify

This app renames ember files generated using the pods structure to follow the classic structure.

## Installation

- `npm install -g ember-unpodify`

## Usage

- Command line: `ember-unpodify` - This must be run at the root directory of an ember project.

## Installation:

#### Using `npx`

Using `npx` you can run the script without installing it first:

```shell
    npx ember-unpodify
```

#### Using `npm`

```shell
    npm install --global ember-unpodify
```

## Usage:

```shell
     ember-unpodify
```

**Note:** This must be run from the root of an ember app or addon.

## Known Issues

This app will not rewrite the contents of any file.

This means any imports that references moved files will be broken.

Most prominently, all classic components in an addon will have their template imports broken as the paths have changed.
