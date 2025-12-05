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
