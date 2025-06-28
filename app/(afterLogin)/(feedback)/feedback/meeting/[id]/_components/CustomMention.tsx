'use client';
import { Mention } from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import MentionList from './MentionList';

interface Attendee {
  id: string;
  label: string;
  profileImage: string;
}

export function createMentionExtension(attendees: Attendee[]) {
  return Mention.extend({
    addAttributes() {
      return {
        id: { default: null },
        label: { default: null },
        profileImage: { default: '/userIcon.png' },
      };
    },

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
      items: ({ query }) =>
        attendees
          .filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 5), // optional: limit suggestions
      render: () => {
        let component: ReactRenderer | null = null;
        let popup: TippyInstance | null = null;

        return {
          onStart: (props) => {
            component = new ReactRenderer(MentionList, {
              props,
              editor: props.editor,
            });

            const dom = document.createElement('div');
            dom.appendChild(component.element);

            popup = tippy(document.body, {
              getReferenceClientRect: props.clientRect as () => DOMRect,
              appendTo: () => document.body,
              content: dom,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
              theme: 'mention',
            });
          },
          onUpdate(props) {
            component?.updateProps(props);
            popup?.setProps({
              getReferenceClientRect: () => {
                const rect = props.clientRect?.();
                // Fallback to a default rect if null
                return rect || new DOMRect(0, 0, 0, 0);
              },
            });
          },
          onExit() {
            popup?.destroy();
            component?.destroy();
          },
        };
      },
    },
  });
}
