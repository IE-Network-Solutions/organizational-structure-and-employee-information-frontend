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
