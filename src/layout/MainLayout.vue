<template>
    <div class="layout">
        <aside class="sidebar">
            <h2>AutoParts</h2>

            <nav>
                <RouterLink to="/">Dashboard</RouterLink>

                <RouterLink to="/products">
                    Productos
                </RouterLink>

                <RouterLink to="/categories">
                    Categorías
                </RouterLink>

                <RouterLink to="/suppliers">
                    Proveedores
                </RouterLink>

                <RouterLink to="/purchases">
                    Compras
                </RouterLink>
            </nav>
        </aside>

        <main class="content">
            <RouterView />
        </main>
    </div>
</template>

<style scoped>
.layout {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 250px;
    background: #111827;
    color: white;
    padding: 20px;
}

.sidebar h2 {
    margin-bottom: 30px;
}

.sidebar nav {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.sidebar a {
    color: #cbd5e1;
    text-decoration: none;
}

.sidebar a.router-link-active {
    color: #60a5fa;
}

.content {
    flex: 1;
    padding: 30px;
    background: #0f172a;
}
</style>