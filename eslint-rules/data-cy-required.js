module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'enforce data-cy attributes on JSX elements',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    // Track imported components/identifiers
    const importedIdentifiers = new Set();
    // Track if we're inside an imported/React component (stack to handle nesting)
    const importedComponentStack = [];

    return {
      // Track all imports to skip checking imported components
      ImportDeclaration(node) {
        // Track default imports
        if (node.specifiers) {
          node.specifiers.forEach((spec) => {
            if (spec.type === 'ImportDefaultSpecifier') {
              importedIdentifiers.add(spec.local.name);
            } else if (spec.type === 'ImportSpecifier') {
              // Track named imports
              importedIdentifiers.add(spec.local.name);
            } else if (spec.type === 'ImportNamespaceSpecifier') {
              // Track namespace imports (e.g., import * as React)
              importedIdentifiers.add(spec.local.name);
            }
          });
        }
      },

      JSXOpeningElement(node) {
        // Skip JSX fragments
        if (node.name.type === 'JSXFragment') {
          return;
        }

        // Skip JSXMemberExpression (e.g., React.Suspense) - these are always components
        if (node.name.type === 'JSXMemberExpression') {
          importedComponentStack.push(true);
          return;
        }

        // Get the tag name for JSXIdentifier
        if (node.name.type !== 'JSXIdentifier') {
          return;
        }

        const tagName = node.name.name;

        // Check if this is an imported component or a React component (PascalCase)
        const isImportedComponent = importedIdentifiers.has(tagName);
        const isReactComponent = tagName[0] === tagName[0].toUpperCase();

        // If it's an imported component or React component, mark that we're inside it
        if (isImportedComponent || isReactComponent) {
          importedComponentStack.push(true);
          return;
        }

        // If we're inside an imported/React component, skip checking children
        if (importedComponentStack.length > 0) {
          return;
        }

        // Skip JSX elements that are part of expression assignments or returns
        // node.parent is JSXElement, so we need to check node.parent.parent
        let jsxElement = node.parent;
        if (jsxElement && jsxElement.type === 'JSXElement') {
          // Helper function to check parent chain
          const checkParentChain = (currentParent) => {
            while (currentParent) {
              // Skip if JSX is wrapped in parentheses (common in expression assignments)
              // This covers: const footer = (...), title: (...), etc.
              if (currentParent.type === 'ParenthesizedExpression') {
                // Check if the parent of ParenthesizedExpression is a Property, VariableDeclarator, or inside ObjectExpression
                let parenParent = currentParent.parent;
                if (
                  parenParent &&
                  (parenParent.type === 'Property' ||
                    parenParent.type === 'ObjectProperty' ||
                    parenParent.type === 'ObjectExpression' ||
                    parenParent.type === 'VariableDeclarator' ||
                    parenParent.type === 'ArrayExpression')
                ) {
                  return true;
                }
                // For ReturnStatement, only skip if it's inside an arrow function used as a value
                if (parenParent && parenParent.type === 'ReturnStatement') {
                  let returnParent = parenParent.parent;
                  while (returnParent) {
                    if (returnParent.type === 'ArrowFunctionExpression') {
                      let arrowParent = returnParent.parent;
                      if (
                        arrowParent &&
                        (arrowParent.type === 'Property' ||
                          arrowParent.type === 'ObjectProperty' ||
                          arrowParent.type === 'VariableDeclarator' ||
                          arrowParent.type === 'ArrayExpression' ||
                          arrowParent.type === 'CallExpression')
                      ) {
                        return true;
                      }
                    }
                    if (
                      returnParent.type === 'FunctionExpression' ||
                      returnParent.type === 'FunctionDeclaration' ||
                      returnParent.type === 'Program'
                    ) {
                      break;
                    }
                    returnParent = returnParent.parent;
                  }
                }
                currentParent = currentParent.parent;
                continue;
              }
              // Skip if JSX is part of a variable declaration (const footer = (...))
              if (currentParent.type === 'VariableDeclarator') {
                return true;
              }
              // Skip if JSX is part of an object property (title: (...))
              if (
                currentParent.type === 'Property' ||
                currentParent.type === 'ObjectProperty'
              ) {
                return true;
              }
              // Skip if JSX is inside an object literal (check if parent is ObjectExpression)
              if (currentParent.type === 'ObjectExpression') {
                return true;
              }
              // Skip if JSX is part of an array element that's a JSX expression
              if (currentParent.type === 'ArrayExpression') {
                return true;
              }
              // Skip if JSX is part of a return statement in an arrow function used as a value
              if (currentParent.type === 'ReturnStatement') {
                // Check if this return is inside an arrow function that's used as a value
                let returnParent = currentParent.parent;
                while (returnParent) {
                  if (returnParent.type === 'ArrowFunctionExpression') {
                    // Check if this arrow function is used as a value (not a component)
                    let arrowParent = returnParent.parent;
                    if (
                      arrowParent &&
                      (arrowParent.type === 'Property' ||
                        arrowParent.type === 'ObjectProperty' ||
                        arrowParent.type === 'VariableDeclarator' ||
                        arrowParent.type === 'ArrayExpression' ||
                        arrowParent.type === 'CallExpression')
                    ) {
                      return true;
                    }
                  }
                  if (
                    returnParent.type === 'FunctionExpression' ||
                    returnParent.type === 'FunctionDeclaration' ||
                    returnParent.type === 'Program'
                  ) {
                    break;
                  }
                  returnParent = returnParent.parent;
                }
              }
              // Skip if JSX is part of a conditional expression (condition ? ... : ...)
              if (currentParent.type === 'ConditionalExpression') {
                return true;
              }
              // Skip if JSX is part of a logical expression (condition && ...)
              if (
                currentParent.type === 'LogicalExpression' &&
                currentParent.operator === '&&'
              ) {
                return true;
              }
              // Stop checking if we reach a JSXElement (we're inside another JSX element)
              if (
                currentParent.type === 'JSXElement' ||
                currentParent.type === 'JSXFragment'
              ) {
                break;
              }
              // Stop at Program level (top level)
              if (currentParent.type === 'Program') {
                break;
              }
              currentParent = currentParent.parent;
            }
            return false;
          };

          if (checkParentChain(jsxElement.parent)) {
            return;
          }
        }

        // Only check native HTML elements (lowercase) that are not inside imported components
        const hasDataCy = node.attributes.some(
          (attr) =>
            attr.type === 'JSXAttribute' &&
            attr.name &&
            attr.name.name === 'data-cy',
        );

        if (!hasDataCy) {
          context.report({
            node,
            message: 'JSX element is missing a data-cy attribute.',
          });
        }
      },

      JSXClosingElement(node) {
        // When closing an imported/React component, pop from stack
        if (node.name.type === 'JSXMemberExpression') {
          importedComponentStack.pop();
          return;
        }

        if (node.name.type === 'JSXIdentifier') {
          const tagName = node.name.name;
          const isImportedComponent = importedIdentifiers.has(tagName);
          const isReactComponent = tagName[0] === tagName[0].toUpperCase();

          if (isImportedComponent || isReactComponent) {
            importedComponentStack.pop();
          }
        }
      },
    };
  },
};
