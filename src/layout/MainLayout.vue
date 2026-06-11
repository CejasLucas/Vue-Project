<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const navItems = [
  { to: "/",           icon: "layout-dashboard", label: "Dashboard" },
  { to: "/purchases",  icon: "shopping-cart",    label: "Purchases" },
  { to: "/suppliers",  icon: "truck",            label: "Suppliers" },
  { to: "/products",   icon: "box",              label: "Products" },
  { to: "/categories", icon: "tag",              label: "Categories" },
  { to: "/brands",     icon: "building-factory", label: "Brands" },
];
</script>

<template>
  <div class="layout">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">
          <i class="ti ti-settings-2" aria-hidden="true" />
        </span>
        <span class="logo-text">Company</span>
      </div>

      <p class="nav-section-label">Navigation</p>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: route.path === item.to }"
        >
          <i :class="`ti ti-${item.icon}`" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-avatar">AA</div>
        <div class="user-info">
          <span class="user-name">Administrator</span>
          <span class="user-email">admin@autoparts.com</span>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="main-wrap">
      <header class="topbar">
        <h1 class="topbar-title">
          {{}}
        </h1>
        <div class="topbar-actions">
          <button class="icon-btn" aria-label="Notifications">
            <i class="ti ti-bell" />
          </button>
          <button class="icon-btn" aria-label="Theme">
            <i class="ti ti-moon" />
          </button>
        </div>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>

  </div>
</template>

<style scoped>
/* ── Layout base ───────────────────────────────────────── */
.layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

/* ── Sidebar ───────────────────────────────────────────── */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--code-bg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 0;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid var(--border);
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--accent-bg);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.logo-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-h);
  letter-spacing: -0.02em;
}

.nav-section-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text);
  padding: 20px 20px 8px;
  margin: 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 10px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  color: var(--text);
  text-decoration: none;
  font-size: 0.88rem;
  transition: background 0.15s, color 0.15s;
}

.nav-item i { font-size: 18px; }

.nav-item:hover {
  background: var(--accent-bg);
  color: var(--text-h);
}

.nav-item.active {
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 500;
}

/* ── Sidebar footer / usuario ──────────────────────────── */
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  margin-top: auto;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent-bg);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-h);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.72rem;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Main wrap ─────────────────────────────────────────── */
.main-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg);
}

/* ── Topbar ────────────────────────────────────────────── */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 56px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.topbar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-h);
  margin: 0;
}

.topbar-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.15s, color 0.15s;
}

.icon-btn:hover {
  background: var(--accent-bg);
  color: var(--accent);
}

/* ── Content ───────────────────────────────────────────── */
.content {
  flex: 1;
  overflow-y: auto;
}

/* ── Responsive ────────────────────────────────────────── */
@media (max-width: 768px) {
  .sidebar { display: none; }
}
</style>