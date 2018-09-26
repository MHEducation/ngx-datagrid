## Pull requests

Good pull requests - patches, improvements, new features - are a fantastic help. They should remain
focused in scope and avoid containing unrelated commits.

**Please ask first** before embarking on any significant pull request (e.g.implementing features,
significant refactors), otherwise you risk spending a lot of time working on something that the
project's maintainers might not want to merge into the project.

Please adhere to the coding conventions used throughout the project. The project includes an
.editorconfig, please make sure your IDE is configured to use it. If you are using VS Code try
[this one](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig).

## Naming Conventions

In general, follow TypeScript naming conventions.
See: https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines

Classes:

- Example: `Compiler`, `ApplicationMetadata`
- Camel case with first letter uppercase
- In general prefer single words. (This is so that when appending `Proto` or `Factory` the class
  is still reasonable to work with.)
- Should not end with `Impl` or any other word which describes a specific implementation of an
  interface.

Interfaces:

- Follow the same rules as Classes
- Should not have `I` or `Interface` in the name or any other way of identifying it as an interface.

Methods and functions:

- Example: `bootstrap`, `someMethod`
- Should be camel case with first letter lowercase

Constants:

- Example: `CORE_DIRECTIVES`
- Should be all uppercase with SNAKE_CASE

## Tech Contacts

Primary - Rico dos Santos
