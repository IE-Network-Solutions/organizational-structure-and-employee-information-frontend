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
    return {
      JSXOpeningElement(node) {
        // Skip JSX fragments
        if (node.name.type === 'JSXFragment') {
          return;
        }

        // Skip JSXMemberExpression (e.g., React.Suspense) - these are always components
        if (node.name.type === 'JSXMemberExpression') {
          return;
        }

        // Get the tag name for JSXIdentifier
        if (node.name.type !== 'JSXIdentifier') {
          return;
        }

        const tagName = node.name.name;

        // Skip React components (PascalCase) - only check HTML elements (lowercase)
        // HTML elements start with lowercase letter
        if (tagName[0] === tagName[0].toUpperCase()) {
          return;
        }

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
    };
  },
};
