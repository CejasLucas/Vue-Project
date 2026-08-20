<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed, watch } from "vue";

export interface DataTableColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  width?: string;
}

const props = withDefaults(
  defineProps<{
    items: T[];
    columns: DataTableColumn[];
    loading?: boolean;
    rowKey?: string;
    title: string;
    subtitle?: string;
    /** Singular entity name used to auto-build button labels, e.g. "brand" → "Add brand", "Update brand"... */
    entityLabel: string;
    /** Overrides for the auto-generated labels, if needed. */
    addLabel?: string;
    viewLabel?: string;
    updateLabel?: string;
    deleteLabel?: string;
    emptyIcon?: string;
    emptyText?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    /** Column keys used by the search box. Defaults to every column. */
    searchKeys?: string[];
    /** Shows the auto "#" index column. */
    showIndex?: boolean;
    /** Allow reading (view-only) action. Set false to hide the View button. */
    viewable?: boolean;
  }>(),
  {
    loading: false,
    rowKey: "id",
    searchable: true,
    showIndex: true,
    viewable: true,
    emptyIcon: "ti-database",
    emptyText: "No records found.",
  }
);

const emit = defineEmits<{
  add: [];
  view: [item: T];
  edit: [item: T];
  delete: [item: T];
  "row-select": [item: T | null];
}>();

const search = ref("");
const selectedKey = ref<unknown>(null);

const subtitleText = computed(
  () => props.subtitle ?? `${props.items.length} registered ${props.title.toLowerCase()}`
);

const addLabelText = computed(() => props.addLabel ?? `Add ${props.entityLabel}`);
const viewLabelText = computed(() => props.viewLabel ?? `View ${props.entityLabel}`);
const updateLabelText = computed(() => props.updateLabel ?? `Update ${props.entityLabel}`);
const deleteLabelText = computed(() => props.deleteLabel ?? `Delete ${props.entityLabel}`);

const selectedItem = computed(
  () => props.items.find((item) => item[props.rowKey] === selectedKey.value) ?? null
);

const filteredItems = computed(() => {
  if (!props.searchable || !search.value.trim()) return props.items;

  const q = search.value.trim().toLowerCase();
  const keys = props.searchKeys?.length ? props.searchKeys : props.columns.map((c) => c.key);

  return props.items.filter((item) =>
    keys.some((key) => String(item[key] ?? "").toLowerCase().includes(q))
  );
});

// If the selected row falls out of the (filtered) dataset, clear selection.
watch(filteredItems, (items) => {
  if (selectedKey.value === null) return;
  const stillThere = items.some((item) => item[props.rowKey] === selectedKey.value);
  if (!stillThere) {
    selectedKey.value = null;
    emit("row-select", null);
  }
});

function selectRow(item: T) {
  const key = item[props.rowKey];
  selectedKey.value = selectedKey.value === key ? null : key;
  emit("row-select", selectedItem.value);
}

function isSelected(item: T) {
  return selectedKey.value !== null && item[props.rowKey] === selectedKey.value;
}

function onView() {
  if (selectedItem.value) emit("view", selectedItem.value);
}

function onEdit() {
  if (selectedItem.value) emit("edit", selectedItem.value);
}

function onDelete() {
  if (selectedItem.value) emit("delete", selectedItem.value);
}

function clearSelection() {
  selectedKey.value = null;
  emit("row-select", null);
}

defineExpose({ clearSelection, selectedItem });
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="header-title">
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-sub">({{ subtitleText }})</p>
      </div>

      <div class="header-actions">
        <div v-if="searchable" class="search-box">
          <i class="ti ti-search" />
          <input
            v-model="search"
            :placeholder="searchPlaceholder ?? `Search ${title.toLowerCase()}...`"
          />
          <button v-if="search" class="clear-btn" title="Clear search" @click="search = ''">
            <i class="ti ti-x" />
          </button>
        </div>

        <div class="action-group">
          <slot name="toolbar-extra" :selected="selectedItem" />

          <button
            v-if="viewable"
            class="btn-action btn-view"
            :disabled="!selectedItem"
            @click="onView"
          >
            <i class="ti ti-eye" />
            {{ viewLabelText }}
          </button>

          <button
            class="btn-action btn-update"
            :disabled="!selectedItem"
            @click="onEdit"
          >
            <i class="ti ti-edit" />
            {{ updateLabelText }}
          </button>

          <button
            class="btn-action btn-delete"
            :disabled="!selectedItem"
            @click="onDelete"
          >
            <i class="ti ti-trash" />
            {{ deleteLabelText }}
          </button>

          <button class="btn-primary" @click="emit('add')">
            <i class="ti ti-plus" />
            {{ addLabelText }}
          </button>
        </div>
      </div>
    </div>

    <div class="table-card">
      <!-- Loading -->
      <div v-if="loading">
        <div v-for="n in 5" :key="n" class="skel row-skel" />
      </div>

      <!-- Empty -->
      <div v-else-if="filteredItems.length === 0" class="empty">
        <i :class="`ti ${emptyIcon}`" aria-hidden="true" />
        <p>{{ search ? "No results match your search." : emptyText }}</p>
      </div>

      <!-- Table -->
      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th class="table-header select-header" style="width: 40px" />
              <th v-if="showIndex" class="table-header text-left" style="width: 50px">#</th>
              <th
                v-for="col in columns"
                :key="col.key"
                class="table-header"
                :class="`text-${col.align ?? 'left'}`"
                :style="col.width ? { width: col.width } : undefined"
              >
                {{ col.label }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(item, index) in filteredItems"
              :key="item[rowKey]"
              :class="{ selected: isSelected(item) }"
              @click="selectRow(item)"
            >
              <td class="select-cell" @click.stop="selectRow(item)">
                <span class="checkbox" :class="{ checked: isSelected(item) }">
                  <i v-if="isSelected(item)" class="ti ti-check" />
                </span>
              </td>

              <td v-if="showIndex" class="mono muted table-content-index">
                {{ index + 1 }}
              </td>

              <td
                v-for="col in columns"
                :key="col.key"
                class="table-content"
                :class="`text-${col.align ?? 'left'}`"
              >
                <slot :name="`cell-${col.key}`" :item="item" :index="index">
                  {{ item[col.key] ?? "—" }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../../styles/layout.css";
@import "../../styles/position.css";
@import "../../styles/utilities.css";
@import "../../styles/table.css";
@import "../../styles/buttons.css";

/* ── Header actions (search + buttons, next to title) ── */
.page-header {
  flex-wrap: wrap;
  row-gap: 12px;
}

.header-title {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 20px;
}

.header-actions {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: space-between;
}

/* ── Search box ───────────────────────────────────── */
/* box-sizing: border-box is the key fix — without it, the 1px border was
   adding 2px on top of the declared height, making this box (and the
   .btn-action buttons below) taller than .btn-primary from buttons.css. */
.search-box {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 400px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.search-box:focus-within {
  border-color: #378add;
  box-shadow: 0 0 0 3px rgba(55, 138, 221, 0.15);
}

.search-box i {
  color: var(--muted);
  font-size: 0.9rem;
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  height: 100%;
  min-width: 0;
  border: none;
  background: transparent;
  color: var(--text-h);
  font-size: 0.82rem;
  outline: none;
}

.search-box .clear-btn {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}

.search-box .clear-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* ── Action buttons (View / Update / Delete) ─────────── */
.action-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-action {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s, opacity 0.15s, transform 0.05s;
}

.btn-action i {
  font-size: 0.95rem;
}

.btn-action:active:not(:disabled) {
  transform: translateY(1px);
}

/* Enabled state per action type */
.btn-action.btn-view:not(:disabled) {
  color: var(--text-h);
}
.btn-action.btn-view:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--muted);
}

.btn-action.btn-update:not(:disabled) {
  color: #378add;
  border-color: rgba(55, 138, 221, 0.4);
}
.btn-action.btn-update:not(:disabled):hover {
  background: rgba(55, 138, 221, 0.1);
  box-shadow: 0 2px 6px rgba(55, 138, 221, 0.18);
}

.btn-action.btn-delete:not(:disabled) {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.4);
}
.btn-action.btn-delete:not(:disabled):hover {
  background: rgba(239, 68, 68, 0.1);
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.18);
}

/* Disabled / locked state — same look for all three */
.btn-action:disabled {
  color: var(--muted);
  border-color: var(--border);
  opacity: 0.5;
  cursor: not-allowed;
  background: transparent;
  transform: none;
}

/* ── Checkbox column ──────────────────────────────── */
.select-header {
  padding: 12px 0 12px 1.1rem;
}

.select-cell {
  padding: 7px 0 7px 1.1rem !important;
  width: 40px;
}

.checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid var(--border);
  background: transparent;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}

.checkbox i {
  font-size: 0.7rem;
  color: #fff;
}

.checkbox.checked {
  background: #378add;
  border-color: #378add;
}

/* ── Selectable rows ──────────────────────────────── */
.data-table tbody tr {
  cursor: pointer;
  transition: background 0.12s;
}

.data-table tbody tr.selected td {
  background: rgba(55, 138, 221, 0.1);
}

.data-table tbody tr.selected td:first-child {
  box-shadow: inset 3px 0 0 #378add;
}
</style>