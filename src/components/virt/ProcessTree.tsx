import * as React from 'react';

function makeTreeItem(processDetails) {
  return {
    name: processDetails.cmdline,
    id: processDetails.process_id,
    children: [],
    isRoot: false,
  };
}

function makeProcessTreeUl(options) {
  return (
    <ul className={options[0].isRoot ? 'crwd-process-tree-root' : 'crwd-process-tree-child'}>
      <li>
        <pre>{options[0].name}</pre>
        {options[0].children.length > 0 && makeProcessTreeUl(options[0].children)}
      </li>
    </ul>
  );
}

export default function ProcessTree({ eppAlert }) {
  let options = [makeTreeItem(eppAlert)];

  if (eppAlert.parent_details) {
    const parent = makeTreeItem(eppAlert.parent_details);
    parent.children = options;
    options = [parent];
  }

  if (eppAlert.grandparent_details) {
    const grandparent = makeTreeItem(eppAlert.grandparent_details);
    grandparent.children = options;
    options = [grandparent];
  }

  options[0].isRoot = true;

  return makeProcessTreeUl(options);
}
