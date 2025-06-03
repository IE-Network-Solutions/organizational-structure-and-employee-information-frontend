'use client';
// lib/mentionExtension.ts
import { Mention } from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import MentionList from './MentionList';

export function createMentionExtension(
  attendees: { id: string; label: string; profileImage: string }[],
) {
  return Mention.extend({
    addAttributes() {
      return {
        id: {},
        label: {},
        profileImage: {},
      };
    },

    // ✅ Parses HTML into mention nodes
    parseHTML() {
      return [
        {
          tag: 'span.mention',
          getAttrs: (element) => {
            const span = element as HTMLElement;
            const img = span.querySelector('img');
            const labelSpan = span.querySelector('span');

            return {
              id: span.getAttribute('data-id'),
              profileImage: img?.getAttribute('src') || '/userIcon.png',
              label: labelSpan?.textContent || '',
            };
          },
        },
      ];
    },

    // ✅ Renders mention node as HTML
    renderHTML({ node }) {
      return [
        'span',
        {
          class:
            'mention inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full relative top-[5px]',
          'data-id': node.attrs.id,
        },
        [
          'img',
          {
            src: node.attrs.profileImage || '/userIcon.png',
            alt: node.attrs.label,
            class: 'w-5 h-5 rounded-full',
          },
        ],
        ['span', { class: 'text-[10px]' }, node.attrs.label],
      ];
    },
  }).configure({
    HTMLAttributes: {
      class: 'mention',
    },
    suggestion: {
      char: '@',
      items: ({ query }) => {
        return attendees.filter((item) =>
          item.label?.toLowerCase().includes(query.toLowerCase()),
        );
      },
      render: () => {
        let component: any;
        let popup: any;

        return {
          onStart: (props) => {
            component = new ReactRenderer(MentionList, {
              props,
              editor: props.editor,
            });

            popup = tippy(
              document.body.appendChild(document.createElement('div')),
              {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                theme: 'mention',
              },
            );
          },
          onUpdate(props) {
            component.updateProps(props);
            popup[0].setProps({
              getReferenceClientRect: props.clientRect,
            });
          },
          onExit() {
            popup[0].destroy();
            component.destroy();
          },
        };
      },
    },
  });
}
