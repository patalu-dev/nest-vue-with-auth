<script setup lang="ts">
import { useBreadcrumb } from '@/composables/useBreadcrumb'

const { setBreadcrumbs } = useBreadcrumb()
// Breadcrumbs setup
setBreadcrumbs([
    { title: 'Dashboard', href: '#' },
])

</script>

<template>
    <div class="flex flex-1 flex-col gap-4 p-4 pt-3">
        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-4">
                <h1 class="text-xl font-semibold">Dashboard</h1>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
