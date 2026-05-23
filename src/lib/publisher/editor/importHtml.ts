function encodeHtmlAttribute(value: string) {
  return encodeURIComponent(value);
}

function normalizeImageElement(image: HTMLImageElement, document: Document) {
  const storImage = document.createElement('stor-image');
  storImage.setAttribute('data-src', image.getAttribute('src') || '');
  storImage.setAttribute(
    'data-alt',
    image.getAttribute('alt') || image.getAttribute('title') || 'Imported DOCX image',
  );

  return storImage;
}

function paragraphContainsOnlyImage(paragraph: HTMLParagraphElement) {
  const meaningfulNodes = Array.from(paragraph.childNodes).filter((node) => {
    if (node.nodeType === paragraph.ownerDocument.TEXT_NODE) {
      return Boolean(node.textContent?.trim());
    }

    if (node.nodeType !== paragraph.ownerDocument.ELEMENT_NODE) {
      return false;
    }

    const element = node as HTMLElement;
    return element.tagName.toLowerCase() !== 'br';
  });

  return (
    meaningfulNodes.length === 1 &&
    meaningfulNodes[0] instanceof HTMLImageElement
  );
}

function normalizeTableHtml(tableHtml: string) {
  const document = new DOMParser().parseFromString(tableHtml, 'text/html');
  const table = document.querySelector('table');
  if (!table) return tableHtml;

  const rows = Array.from(table.querySelectorAll('tr'));
  if (!rows.length) return table.outerHTML;

  const headerCells = table.querySelectorAll('th');
  if (!headerCells.length) {
    const firstRow = rows[0];
    if (firstRow) {
      const promotedCells = Array.from(firstRow.children)
        .filter((cell): cell is HTMLTableCellElement => cell instanceof HTMLTableCellElement)
        .map((cell) => {
          const th = document.createElement('th');
          th.innerHTML = cell.innerHTML;
          th.setAttribute('scope', 'col');

          for (const attr of Array.from(cell.attributes)) {
            if (attr.name === 'scope') continue;
            th.setAttribute(attr.name, attr.value);
          }

          return th;
        });

      if (promotedCells.length) {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        for (const cell of promotedCells) {
          headerRow.appendChild(cell);
        }
        thead.appendChild(headerRow);

        const rowParent = firstRow.parentElement;
        if (rowParent?.tagName === 'TBODY') {
          table.insertBefore(thead, rowParent);
          rowParent.removeChild(firstRow);

          if (!rowParent.children.length) {
            rowParent.remove();
          }
        } else if (rowParent === table) {
          table.replaceChild(thead, firstRow);
        }
      }
    }
  }

  if (!table.querySelector('tbody')) {
    const bodyRows = Array.from(table.querySelectorAll(':scope > tr'));
    if (bodyRows.length) {
      const tbody = document.createElement('tbody');
      for (const row of bodyRows) {
        tbody.appendChild(row);
      }
      table.appendChild(tbody);
    }
  }

  return table.outerHTML;
}

export function transformImportedHtml(html: string) {
  const document = new DOMParser().parseFromString(html, 'text/html');

  for (const table of Array.from(document.querySelectorAll('table'))) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<stor-table data-html="${encodeHtmlAttribute(
      normalizeTableHtml(table.outerHTML),
    )}"></stor-table>`;
    const storTable = wrapper.firstElementChild;
    if (storTable) {
      table.replaceWith(storTable);
    }
  }

  for (const paragraph of Array.from(document.querySelectorAll('p'))) {
    if (!paragraphContainsOnlyImage(paragraph)) continue;

    const image = paragraph.querySelector('img');
    if (!image) continue;

    paragraph.replaceWith(normalizeImageElement(image, document));
  }

  for (const image of Array.from(document.querySelectorAll('img'))) {
    image.replaceWith(normalizeImageElement(image, document));
  }

  return document.body.innerHTML;
}
