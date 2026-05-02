import * as vscode from "vscode";
import { FormResult, FormSchema } from "./types";

export const showForm = async (
  schema: FormSchema
): Promise<FormResult | undefined> => {
  return new Promise((resolve) => {
    const panel = vscode.window.createWebviewPanel(
      "springCodeGeneratorForm",
      schema.title,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    panel.webview.html = renderHtml(panel.webview, schema);

    let resolved = false;
    const disposables: vscode.Disposable[] = [];

    const settle = (value: FormResult | undefined) => {
      if (resolved) {
        return;
      }
      resolved = true;
      resolve(value);
    };

    disposables.push(
      panel.webview.onDidReceiveMessage(
        (message: { type: string; data?: FormResult }) => {
          if (message.type === "submit") {
            settle(message.data);
            panel.dispose();
          } else if (message.type === "cancel") {
            settle(undefined);
            panel.dispose();
          }
        }
      )
    );

    disposables.push(
      panel.onDidDispose(() => {
        settle(undefined);
        for (const d of disposables) {
          d.dispose();
        }
      })
    );
  });
};

const generateNonce = (): string => {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderHtml = (webview: vscode.Webview, schema: FormSchema): string => {
  const nonce = generateNonce();
  const schemaJson = JSON.stringify(schema).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>${escapeHtml(schema.title)}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="container">
    <header>
      <h1 id="form-title"></h1>
      <p id="form-description"></p>
    </header>
    <form id="form" autocomplete="off"></form>
    <footer>
      <button type="button" id="cancel-btn" class="secondary">Cancel</button>
      <button type="button" id="submit-btn" class="primary">Generate</button>
    </footer>
  </div>
  <script id="schema-data" type="application/json">${schemaJson}</script>
  <script nonce="${nonce}">${SCRIPT}</script>
</body>
</html>`;
};

const CSS = `
* { box-sizing: border-box; }
body {
  font-family: var(--vscode-font-family);
  font-size: var(--vscode-font-size);
  color: var(--vscode-foreground);
  background: var(--vscode-editor-background);
  margin: 0;
  padding: 32px 16px;
  display: flex;
  justify-content: center;
}
.container {
  width: 100%;
  max-width: 800px;
}
header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vscode-panel-border);
}
h1 { font-size: 1.4em; margin: 0 0 8px 0; font-weight: 600; }
#form-description { margin: 0; color: var(--vscode-descriptionForeground); }
#form-description:empty { display: none; }
form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.hidden { display: none; }
.field > label { font-weight: 600; }
.field .description { margin: 0; font-size: 0.9em; color: var(--vscode-descriptionForeground); }
.field input[type="text"],
.field textarea,
.field select {
  width: 100%;
  padding: 6px 8px;
  background: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
  border: 1px solid var(--vscode-input-border, transparent);
  border-radius: 2px;
  font-family: var(--vscode-font-family);
  font-size: var(--vscode-font-size);
}
.field input[type="text"]:focus,
.field textarea:focus,
.field select:focus {
  outline: 1px solid var(--vscode-focusBorder);
  outline-offset: -1px;
}
.field textarea { resize: vertical; min-height: 80px; font-family: var(--vscode-editor-font-family, monospace); }
.checkbox-row { display: flex; align-items: center; gap: 8px; }
.checkbox-row input[type="checkbox"] { margin: 0; }
.multi-select-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
  border-radius: 2px;
  background: var(--vscode-input-background);
}
.multi-option { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 2px 0; }
.multi-option .option-description { color: var(--vscode-descriptionForeground); font-size: 0.85em; }
.list-container { display: flex; flex-direction: column; gap: 8px; }
.list-item {
  border: 1px solid var(--vscode-panel-border);
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--vscode-editorWidget-background);
}
.list-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: var(--vscode-descriptionForeground);
}
.list-item-remove {
  background: transparent;
  border: none;
  color: var(--vscode-errorForeground);
  cursor: pointer;
  font-size: 0.9em;
  padding: 2px 8px;
}
.list-item-remove:hover { text-decoration: underline; }
.list-add {
  align-self: flex-start;
  padding: 4px 12px;
  background: transparent;
  border: 1px dashed var(--vscode-input-border, var(--vscode-panel-border));
  color: var(--vscode-foreground);
  cursor: pointer;
  border-radius: 2px;
  font-family: var(--vscode-font-family);
  font-size: var(--vscode-font-size);
}
.list-add:hover { background: var(--vscode-list-hoverBackground); }
.error-message { color: var(--vscode-errorForeground); font-size: 0.85em; min-height: 0; }
.error-message:empty { display: none; }
footer {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid var(--vscode-panel-border);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
button {
  padding: 6px 14px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  font-family: var(--vscode-font-family);
  font-size: var(--vscode-font-size);
}
button.primary { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
button.primary:hover { background: var(--vscode-button-hoverBackground); }
button.secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
button.secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
.required-asterisk { color: var(--vscode-errorForeground); margin-left: 2px; }
`;

const SCRIPT = `
(function() {
  const vscode = acquireVsCodeApi();
  const schema = JSON.parse(document.getElementById('schema-data').textContent);

  const titleEl = document.getElementById('form-title');
  const descEl = document.getElementById('form-description');
  const formEl = document.getElementById('form');
  const submitBtn = document.getElementById('submit-btn');
  const cancelBtn = document.getElementById('cancel-btn');

  titleEl.textContent = schema.title;
  if (schema.description) descEl.textContent = schema.description;
  if (schema.submitLabel) submitBtn.textContent = schema.submitLabel;

  for (const field of schema.fields) {
    formEl.appendChild(renderField(field));
  }

  formEl.addEventListener('input', () => updateConditionalVisibility());
  formEl.addEventListener('change', () => updateConditionalVisibility());
  updateConditionalVisibility();

  submitBtn.addEventListener('click', () => {
    const data = collectData(formEl, schema.fields);
    const errors = validate(formEl, schema.fields, data);
    if (errors.length > 0) return;
    vscode.postMessage({ type: 'submit', data });
  });
  cancelBtn.addEventListener('click', () => vscode.postMessage({ type: 'cancel' }));

  function renderField(field) {
    const wrap = document.createElement('div');
    wrap.className = 'field';
    wrap.dataset.fieldName = field.name;
    wrap.dataset.fieldKind = field.kind;
    if (field.showWhen) {
      wrap.dataset.showWhenField = field.showWhen.field;
      wrap.dataset.showWhenEquals = JSON.stringify(field.showWhen.equals);
    }

    const label = document.createElement('label');
    label.textContent = field.label;
    if (field.required) {
      const ast = document.createElement('span');
      ast.className = 'required-asterisk';
      ast.textContent = '*';
      label.appendChild(ast);
    }
    wrap.appendChild(label);

    if (field.description) {
      const d = document.createElement('p');
      d.className = 'description';
      d.textContent = field.description;
      wrap.appendChild(d);
    }

    let inputEl;
    switch (field.kind) {
      case 'text':        inputEl = renderText(field); break;
      case 'textarea':    inputEl = renderTextarea(field); break;
      case 'select':      inputEl = renderSelect(field); break;
      case 'multiSelect': inputEl = renderMultiSelect(field); break;
      case 'checkbox':    inputEl = renderCheckbox(field); break;
      case 'list':        inputEl = renderList(field); break;
    }
    if (inputEl) wrap.appendChild(inputEl);

    const errEl = document.createElement('div');
    errEl.className = 'error-message';
    wrap.appendChild(errEl);

    return wrap;
  }

  function renderText(field) {
    const i = document.createElement('input');
    i.type = 'text';
    i.dataset.fieldName = field.name;
    if (field.placeholder) i.placeholder = field.placeholder;
    if (field.default) i.value = field.default;
    return i;
  }
  function renderTextarea(field) {
    const t = document.createElement('textarea');
    t.dataset.fieldName = field.name;
    if (field.placeholder) t.placeholder = field.placeholder;
    if (field.default) t.value = field.default;
    return t;
  }
  function renderSelect(field) {
    const s = document.createElement('select');
    s.dataset.fieldName = field.name;
    for (const opt of field.options) {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.description ? opt.label + ' — ' + opt.description : opt.label;
      if (opt.value === field.default) o.selected = true;
      s.appendChild(o);
    }
    return s;
  }
  function renderMultiSelect(field) {
    const wrap = document.createElement('div');
    wrap.className = 'multi-select-options';
    wrap.dataset.fieldName = field.name;
    const defaults = new Set(field.defaults || []);
    for (const opt of field.options) {
      const row = document.createElement('label');
      row.className = 'multi-option';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = opt.value;
      if (defaults.has(opt.value)) cb.checked = true;
      row.appendChild(cb);
      const text = document.createElement('span');
      text.textContent = opt.label;
      row.appendChild(text);
      if (opt.description) {
        const d = document.createElement('span');
        d.className = 'option-description';
        d.textContent = '— ' + opt.description;
        row.appendChild(d);
      }
      wrap.appendChild(row);
    }
    return wrap;
  }
  function renderCheckbox(field) {
    const wrap = document.createElement('div');
    wrap.className = 'checkbox-row';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.fieldName = field.name;
    if (field.default) cb.checked = true;
    wrap.appendChild(cb);
    return wrap;
  }
  function renderList(field) {
    const wrap = document.createElement('div');
    wrap.className = 'list-container';
    wrap.dataset.fieldName = field.name;

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'list-items';
    wrap.appendChild(itemsContainer);

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'list-add';
    addBtn.textContent = '+ Add ' + field.itemLabel;
    addBtn.addEventListener('click', () => {
      addListItem(itemsContainer, field);
      updateConditionalVisibility();
    });
    wrap.appendChild(addBtn);

    const initial = field.defaultItems != null ? field.defaultItems : (field.minItems || 0);
    for (let i = 0; i < initial; i++) {
      addListItem(itemsContainer, field);
    }
    return wrap;
  }
  function addListItem(container, field) {
    const idx = container.children.length;
    const item = document.createElement('div');
    item.className = 'list-item';
    item.dataset.itemIndex = String(idx);

    const header = document.createElement('div');
    header.className = 'list-item-header';
    const title = document.createElement('span');
    title.textContent = field.itemLabel + ' #' + (idx + 1);
    header.appendChild(title);
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'list-item-remove';
    removeBtn.textContent = '✕ Remove';
    removeBtn.addEventListener('click', () => {
      item.remove();
      renumberItems(container, field.itemLabel);
      updateConditionalVisibility();
    });
    header.appendChild(removeBtn);
    item.appendChild(header);

    for (const sub of field.fields) {
      item.appendChild(renderField(sub));
    }
    container.appendChild(item);
  }
  function renumberItems(container, label) {
    Array.from(container.children).forEach((c, i) => {
      const t = c.querySelector('.list-item-header > span');
      if (t) t.textContent = label + ' #' + (i + 1);
      c.dataset.itemIndex = String(i);
    });
  }

  function updateConditionalVisibility() {
    // Iterate in document order (querySelectorAll guarantees this) so a field's
    // dependency has already been evaluated before this field is checked. This
    // means hiding cascades correctly when B showWhen A and A showWhen X.
    const fields = formEl.querySelectorAll('.field');
    fields.forEach(f => {
      const targetField = f.dataset.showWhenField;
      if (!targetField) return;
      let expected;
      try { expected = JSON.parse(f.dataset.showWhenEquals); } catch { expected = f.dataset.showWhenEquals; }
      const scopeEl = f.closest('.list-item') || formEl;
      const target = findFieldInScope(scopeEl, targetField);
      if (!target || target.classList.contains('hidden')) {
        f.classList.add('hidden');
        return;
      }
      const value = readFieldValue(target);
      const matches = Array.isArray(expected) ? expected.includes(value) : value === expected;
      f.classList.toggle('hidden', !matches);
    });
  }
  function findFieldInScope(scope, name) {
    const candidates = scope.querySelectorAll('.field[data-field-name="' + name + '"]');
    for (const c of candidates) {
      if (isDirectScopeChild(c, scope)) return c;
    }
    return null;
  }
  function isDirectScopeChild(node, scope) {
    let p = node.parentElement;
    while (p && p !== scope) {
      if (p.classList && p.classList.contains('list-item') && p !== scope) return false;
      p = p.parentElement;
    }
    return p === scope;
  }
  function readFieldValue(fieldEl) {
    const kind = fieldEl.dataset.fieldKind;
    if (kind === 'checkbox') {
      const cb = fieldEl.querySelector('input[type="checkbox"]');
      return cb ? cb.checked : false;
    }
    if (kind === 'select') {
      const s = fieldEl.querySelector('select');
      return s ? s.value : '';
    }
    if (kind === 'text' || kind === 'textarea') {
      const i = fieldEl.querySelector('input,textarea');
      return i ? i.value : '';
    }
    return undefined;
  }

  function collectData(scope, fields) {
    const result = {};
    for (const field of fields) {
      const el = findFieldInScope(scope, field.name);
      if (!el) continue;
      if (el.classList.contains('hidden')) continue;
      result[field.name] = collectField(el, field);
    }
    return result;
  }
  function collectField(fieldEl, field) {
    switch (field.kind) {
      case 'text':
      case 'textarea': {
        const i = fieldEl.querySelector('[data-field-name="' + field.name + '"]');
        return i ? i.value : '';
      }
      case 'select': {
        const s = fieldEl.querySelector('select[data-field-name="' + field.name + '"]');
        return s ? s.value : '';
      }
      case 'multiSelect': {
        const wrap = fieldEl.querySelector('.multi-select-options[data-field-name="' + field.name + '"]');
        if (!wrap) return [];
        return Array.from(wrap.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      }
      case 'checkbox': {
        const cb = fieldEl.querySelector('input[type="checkbox"][data-field-name="' + field.name + '"]');
        return cb ? cb.checked : false;
      }
      case 'list': {
        const wrap = fieldEl.querySelector('.list-container[data-field-name="' + field.name + '"]');
        if (!wrap) return [];
        const items = wrap.querySelector('.list-items');
        return Array.from(items.children).map(item => collectData(item, field.fields));
      }
    }
    return null;
  }

  function validate(scope, fields, data) {
    const errors = [];
    for (const field of fields) {
      const el = findFieldInScope(scope, field.name);
      if (!el) continue;
      const errEl = directErrorChild(el);
      if (errEl) errEl.textContent = '';
      if (el.classList.contains('hidden')) continue;
      const val = data[field.name];
      if (field.required) {
        const empty = val === '' || val == null || (Array.isArray(val) && val.length === 0);
        if (empty) {
          errors.push(field.name);
          if (errEl) errEl.textContent = field.label + ' is required';
          continue;
        }
      }
      if (field.pattern && typeof val === 'string' && val.length > 0) {
        try {
          const re = new RegExp(field.pattern);
          if (!re.test(val)) {
            errors.push(field.name);
            if (errEl) errEl.textContent = field.patternError || 'Invalid format';
          }
        } catch {
          // Invalid regex in schema — silently skip
        }
      }
      if (field.kind === 'list' && Array.isArray(data[field.name])) {
        const wrap = el.querySelector('.list-container[data-field-name="' + field.name + '"]');
        const items = wrap.querySelector('.list-items');
        Array.from(items.children).forEach((itemEl, i) => {
          const itemData = data[field.name][i] || {};
          const subErrs = validate(itemEl, field.fields, itemData);
          errors.push(...subErrs.map(e => field.name + '[' + i + '].' + e));
        });
      }
    }
    return errors;
  }
  function directErrorChild(fieldEl) {
    return Array.from(fieldEl.children).find(c => c.classList && c.classList.contains('error-message'));
  }
})();
`;
