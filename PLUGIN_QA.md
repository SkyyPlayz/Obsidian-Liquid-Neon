# Liquid Neon Plugin Theme QA Checklist

**Purpose:** Reusable pre-release QA procedure for all themed plugins. Each row is a smoke test surface that must pass before release.

**Test environment:** Obsidian vault with all listed plugins installed. Test against current `main` branch (v0.3.0 + post-release commits).

**Definitions:**
- **Cyan:** `#00F0FF` — primary interaction color
- **Violet:** `#9B5FFF` — secondary depth color
- **Magenta:** `#FF4DFF` — high-priority/accent color
- **Glow:** neon halo effect (outer shadow) around interactive elements
- **Glass:** semi-transparent background with subtle blue-purple tint

---

## Plugin Checklist

### 1. Kanban (LN-37)

| Surface | CSS Selectors to Verify | Expected Visual Outcome | Severity |
|---------|------------------------|------------------------|----------|
| **Lane container** | `.kanban-plugin__lane` | Violet-tinted glass column; left border has violet gradient | high |
| **Lane title** | `.kanban-plugin__lane-title` | Violet text with subtle text-shadow glow (violet) | high |
| **Item card default** | `.kanban-plugin__item` | Subtle cyan-tinted glass; thin cyan border | high |
| **Item card hover** | `.kanban-plugin__item:hover` | Cyan border brightens; cyan glow appears (`box-shadow: 0 0 8px cyan`) | high |
| **Item card active** | `.kanban-plugin__item:active` | Violet frame; violet glow | medium |
| **Search bar** | `.kanban-plugin__search-wrapper` | Cyan bottom border | medium |

**Known issues:** GH#36 (none reported for Kanban as of 2026-06-16)

---

### 2. Calendar Plugin (LN-28)

| Surface | CSS Selectors to Verify | Expected Visual Outcome | Severity |
|---------|------------------------|------------------------|----------|
| **Today cell** | `.theme-dark .calendar .day.today` | Cyan background or cyan text highlight | high |
| **Has-note cell** | `.theme-dark .calendar .day.has-note` | Magenta background or magenta text highlight | high |
| **Active/selected cell** | `.theme-dark .calendar .day.is-selected` | Violet highlight or glow | high |
| **Nav buttons** | `.theme-dark .calendar .nav .clickable-icon` | Glowing interaction on hover | medium |

**Known issues:** GH#36 — calendar color overrides not persisted in all Obsidian 1.x versions

---

### 3. Obsidian Git (LN-30)

| Surface | CSS Selectors to Verify | Expected Visual Outcome | Severity |
|---------|------------------------|------------------------|----------|
| **Staged files** | `.workspace-leaf-content[data-type="git"] .staged-item` | Cyan text or highlight | high |
| **Unstaged files** | `.workspace-leaf-content[data-type="git"] .unstaged-item` | Magenta text or highlight | high |
| **Commit button** | `.workspace-leaf-content[data-type="git"] .git-button.mod-cta` | Cyan/violet glow on interaction | medium |
| **Commit entry hover** | `.workspace-leaf-content[data-type="git"] .git-commit-entry:hover` | Subtle glass background highlight | medium |

**Known issues:** GH#36 (none reported for Obsidian Git as of 2026-06-16)

---

### 4. Advanced Tables (LN-29)

| Surface | CSS Selectors to Verify | Expected Visual Outcome | Severity |
|---------|------------------------|------------------------|----------|
| **Toolbar** | `.mod-table-editor-controls` | Glass surface with neon-glow buttons; cyan/violet glow on hover | high |
| **Sort popup** | `.mod-table-sort-popup` | Violet-tinted glass modal; violet accents on buttons | high |
| **Cell focus** | `.mod-table-cell-is-focus` | Cyan focus ring or glow | medium |

**Known issues:** GH#36 (none reported for Advanced Tables as of 2026-06-16)

---

### 5. Dataview (LN-32)

| Surface | CSS Selectors to Verify | Expected Visual Outcome | Severity |
|---------|------------------------|------------------------|----------|
| **Table header** | `.theme-dark .dataview.table-view-table thead` | Cyan text glow or cyan-tinted background | high |
| **Table row hover** | `.theme-dark .dataview.table-view-table tbody tr:hover` | Cyan highlight or subtle glow | high |
| **Error box** | `.dataview-error-box` | Magenta or red error text | medium |
| **Inline query result** | `.dataview.inline-data` | Cyan accent text | medium |

**Known issues:** GH#36 — dataview selectors are chained (`.dataview.table-view-table`), not bare class; ensure theme uses chained selector

---

### 6. Tasks (LN-38)

| Surface | CSS Selectors to Verify | Expected Visual Outcome | Severity |
|---------|------------------------|------------------------|----------|
| **Query block container** | `.block-language-tasks .tasks-query` | Glass background with subtle neon accents | high |
| **Task priority indicators** | `.theme-dark .tasks-list-item[data-priority]` | Colors match priority: cyan=none, magenta=high, etc. | high |
| **Overdue task** | `.tasks-list-item.is-overdue` | Magenta or red text highlight | high |
| **Completed task** | `.tasks-list-item.is-done` | Strikethrough + reduced opacity | medium |

**Known issues:** GH#36 (none reported for Tasks as of 2026-06-16)

---

### 7. Excalidraw (LN-39)

| Surface | CSS Selectors to Verify | Expected Visual Outcome | Severity |
|---------|------------------------|------------------------|----------|
| **Toolbar buttons** | `.excalidraw .ToolIcon_type_button` | Glass surface; cyan/violet glow on hover | high |
| **Island popup** | `.excalidraw .Island` | Glass-morphic modal with neon accents | high |
| **Color picker** | `.excalidraw .color-picker__button` | Interactive button styling with glow | medium |
| **Canvas background** | `.excalidraw svg` | Opaque dark background (never transparent; see SKY-721) | high |

**Known issues:** GH#36 (none reported for Excalidraw as of 2026-06-16)

---

### 8. QuickAdd (LN-43)

| Surface | CSS Selectors to Verify | Expected Visual Outcome | Severity |
|---------|------------------------|------------------------|----------|
| **Modal glass** | `.modal.quickAddModal` | Semi-transparent neon-glass modal frame | high |
| **Modal title** | `.modal.quickAddModal .modal-title` | Cyan or violet text with subtle glow | high |
| **Input field** | `.modal.quickAddModal input[type="text"]` | Cyan border glow on focus | high |
| **Menu frame** | `.quickAddModal .menu-item` | Cyan/violet neon frame on hover/active | high |

**Known issues:** GH#36 (none reported for QuickAdd as of 2026-06-16)

---

### 9. LanguageTool

| Surface | CSS Selectors to Verify | Expected Visual Outcome | Severity |
|---------|------------------------|------------------------|----------|
| **Status bar icon** | `.status-bar-item.plugin-obsidian-languagetool-plugin` | Glowing icon on interaction (cyan/violet glow on hover) | medium |
| **Tooltip/popup** | `.status-bar-item.plugin-obsidian-languagetool-plugin [tooltip]` | Neon-glass tooltip with cyan/violet text | medium |

**Known issues:** GH#36 (none reported for LanguageTool as of 2026-06-16)

---

### 10. Editing Toolbar

| Surface | CSS Selectors to Verify | Expected Visual Outcome | Severity |
|---------|------------------------|------------------------|----------|
| **Toolbar container** | `.editing-toolbar-container` | Glass background with neon accents | medium |
| **Toolbar buttons** | `.editing-toolbar-button` | Cyan/violet glow on hover/active | medium |
| **Bottom border** | `.editing-toolbar-container::after` | Gradient border (cyan/violet/magenta) | low |

**Known issues:** GH#36 (none reported for Editing Toolbar as of 2026-06-16)

---

### 11. Highlighter

| Surface | CSS Selectors to Verify | Expected Visual Outcome | Severity |
|---------|------------------------|------------------------|----------|
| **Color picker menu** | `.menu.highlighterContainer` | Glass modal with neon-styled color swatches | medium |
| **Color swatch hover** | `.menu.highlighterContainer .menu-item:hover` | Cyan/violet glow on color selection | medium |

**Known issues:** GH#36 (none reported for Highlighter as of 2026-06-16)

---

### 12. Chat Block

| Surface | CSS Selectors to Verify | Expected Visual Outcome | Severity |
|---------|------------------------|------------------------|----------|
| **Chat container** | `.block-language-chat` | Glass-morphic container with neon accents | medium |
| **Chat bubble hover** | `.chat-view-bubble:hover` | Subtle cyan or violet glow/highlight | medium |
| **Chat background** | `.chat-view-container` | Semi-transparent glass surface (not fully transparent) | high |

**Known issues:** GH#36 (none reported for Chat Block as of 2026-06-16)

---

### 13. Omnisearch (LN-49)

| Surface | CSS Selectors to Verify | Expected Visual Outcome | Severity |
|---------|------------------------|------------------------|----------|
| **Modal overlay** | `.prompt.omnisearch-modal` | Neon-glass frame with cyan border/glow | high |
| **Search input** | `.omnisearch-input-field .prompt-input` | Cyan border; cyan glow on focus | high |
| **Result row base** | `.suggestion-item.omnisearch-result` | Transparent, slight rounded corners | high |
| **Result row hover** | `.suggestion-item.omnisearch-result:hover` | Cyan-tinted glass with left border accent | high |
| **Result row selected** | `.suggestion-item.omnisearch-result.is-selected` | Cyan background + inset left border | high |
| **Result title** | `.omnisearch-result__title` | Cyan text with subtle glow when selected | high |
| **File extension badge** | `.omnisearch-result__extension` | Magenta-glass pill (bg, border, text) | medium |
| **Match count badge** | `.omnisearch-result__counter` | Magenta-glass pill with semibold text | medium |
| **Result excerpt** | `.omnisearch-result__body` | Muted text; cyan on selected row | medium |
| **Folder path** | `.omnisearch-result__folder-path` | Muted text; violet on selected row | medium |
| **Text highlight** | `.omnisearch-default-highlight` | Cyan underline on matched text | medium |
| **Keyboard hints** | `.prompt-instruction-command` | Violet-glass pill styling | medium |

**Known issues:** GH#36 (none reported for Omnisearch as of 2026-06-16)

---

## Test Procedure

### Setup
1. Launch Obsidian with Liquid Neon theme activated (main branch)
2. Create or open a test vault with all 12 plugins installed
3. Navigate to each plugin's primary interface

### Verification Steps (per plugin row)
1. **Visual inspection:** Open DevTools (Ctrl+Shift+I) or Obsidian's Appearance tab
2. **CSS selector lookup:** Right-click the element → Inspect → locate selector in theme.css
3. **Color verification:** Compare computed style to expected color in this checklist
4. **Glow/effect verification:** Hover/interact with element and confirm glow/transition behavior
5. **Log findings:** If any surface fails, document the selector, expected color, actual color, and severity

### Companion Graph Refresh Smoke Test (LN-50)
1. Install/enable the Liquid Neon Companion plugin and confirm **Auto-refresh graph on color change** is on by default in the plugin settings.
2. Open Obsidian's Graph view and keep it visible.
3. In Style Settings, change one graph color picker such as Node, Focused node, Tag node, Attachment node, Unresolved node, or Edge line.
4. Confirm the graph view refreshes once within 500ms of the final picker change and shows **Liquid Neon: graph colors updated** when notices are enabled.
5. Drag a graph color picker rapidly and confirm the graph refresh is debounced (one refresh after the drag settles, not a refresh for every intermediate value).
6. Close all Graph views, change a graph color again, and confirm there is no error and no refresh notice.
7. Toggle **Auto-refresh graph on color change** off, restart Obsidian, and confirm the setting persists and color changes no longer auto-refresh open graph views.
8. Toggle **Show graph refresh notice** off and confirm graph refreshes still happen without the notice.

### Companion Settings Tab Smoke Test (LN-51)

1. Open **Settings → Liquid Neon Companion**. Confirm the tab opens without console errors.
2. Verify three section headings are visible: **Background**, **Graph Colors**, **Advanced**.
3. In the **Graph Colors** section, confirm six colour-swatch rows are present: Node, Focused node, Tag node, Attachment node, Unresolved node, Edge line.
4. Each swatch must be a 16×16px square with `border-radius: 3px` and a visible border. Confirm its `background-color` matches the live CSS variable (open DevTools, inspect the swatch `<span>`, and compare `background-color` against `getComputedStyle(document.body).getPropertyValue('--ln-graph-node')` etc.).
5. Open **Style Settings → Liquid Neon → Graph Colors** and change any colour. Without closing the Companion settings tab, confirm the corresponding swatch updates to the new colour within one paint frame.
6. Confirm the **Auto-refresh graph on color change** toggle is present in the **Graph Colors** section, defaults to **on**, and persists its value across an Obsidian restart.
7. Confirm the **Show graph refresh notice** toggle is present in the **Graph Colors** section.
8. Confirm the notice *"Graph colors update when the graph view is reopened. Enable Auto-refresh above to automate this."* appears below the swatch rows.
9. In the **Advanced** section, confirm the **Version** row shows `Liquid Neon Companion v{N} | Theme v{N}` with real version strings (not "unknown"), assuming the theme is installed in the active vault.
10. Close and reopen the settings tab; confirm swatches reflect current computed values on each open.

### Pass Criteria
- All **high** severity items must pass
- All **medium** severity items must pass
- **Low** severity items are nice-to-have; flagged as enhancements if broken

### Failure Escalation
1. If a surface fails, post a comment with:
   - Plugin name and selector
   - Expected vs actual color (include hex values)
   - Screenshot showing the broken state
   - Link to this checklist row
2. File a child issue on SKY-1917 with `priority: high` if severity is high
3. Label the issue with `regression` if the surface worked in v0.3.0

---

## Known GitHub Issues

| Issue | Plugin | Status | Notes |
|-------|--------|--------|-------|
| [GH#36](https://github.com/SkyyPlayz/Obsidian-Liquid-Neon/issues/36) | Multiple | Open | Community-reported plugin theme issues; use as reference for regression detection |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-16 | Initial QA checklist for v0.3.1 release gate |
