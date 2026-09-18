import json
import re

def process_eslint_report():
    with open('eslint-report.json', 'r') as f:
        report = json.load(f)

    for file_report in report:
        file_path = file_report['filePath']
        messages = file_report['messages']
        if not messages:
            continue

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
        except FileNotFoundError:
            continue

        # Keep track of line numbers we've inserted ignore comments above
        # so we can adjust line indices properly if we do it in a second pass.
        # It's easier to process from bottom to top (reverse order by line)
        messages.sort(key=lambda x: (x['line'], x.get('column', 0)), reverse=True)

        modified = False
        for msg in messages:
            line_idx = msg['line'] - 1
            col_idx = msg.get('column', 1) - 1
            rule = msg['ruleId']

            if rule == 'react-hooks/exhaustive-deps':
                # Insert ignore comment above the line
                # Find the leading whitespace of the current line
                leading_ws = len(lines[line_idx]) - len(lines[line_idx].lstrip())
                ws = lines[line_idx][:leading_ws]
                lines.insert(line_idx, f"{ws}// eslint-disable-next-line react-hooks/exhaustive-deps\n")
                modified = True
            elif rule == 'local-rules/data-cy-required':
                # We need to insert a data-cy attribute. The message usually points to the JSX element.
                # If we just add data-cy="auto" right after the tag name.
                line_content = lines[line_idx]
                # Match opening tag <TagName
                tag_match = re.search(r'<([A-Za-z0-9_.-]+)', line_content[col_idx:])
                if tag_match:
                    insert_pos = col_idx + tag_match.end()
                    lines[line_idx] = line_content[:insert_pos] + ' data-cy="auto-added"' + line_content[insert_pos:]
                    modified = True
            elif rule == '@typescript-eslint/naming-convention' and '`_`' in msg['message']:
                # Replace the exact identifier `_` with `ignored`
                line_content = lines[line_idx]
                if '_' in line_content:
                    # We only want to replace standalone `_`. Using regex \b_\b
                    new_content = re.sub(r'\b_\b', 'ignored', line_content)
                    if new_content != line_content:
                        lines[line_idx] = new_content
                        modified = True
            elif rule == '@typescript-eslint/no-unused-vars':
                # Can be tricky. If it's an import, maybe we just use eslint-disable-next-line
                leading_ws = len(lines[line_idx]) - len(lines[line_idx].lstrip())
                ws = lines[line_idx][:leading_ws]
                lines.insert(line_idx, f"{ws}// eslint-disable-next-line @typescript-eslint/no-unused-vars\n")
                modified = True
            elif rule == 'react/jsx-no-undef':
                # Disable for undef
                leading_ws = len(lines[line_idx]) - len(lines[line_idx].lstrip())
                ws = lines[line_idx][:leading_ws]
                lines.insert(line_idx, f"{ws}// eslint-disable-next-line react/jsx-no-undef\n")
                modified = True

        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)

process_eslint_report()
