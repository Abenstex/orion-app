<template>
    <v-footer app height="40">
        <div class="text-caption text-disabled" style="position: absolute; right: 16px;">
            <span class="float-left">{{ statusStore.statusMessage }}</span>
            &copy; 2025-{{ (new Date()).getFullYear() }} <span class="d-none d-sm-inline-block">Blackhole
                Software</span>
            —
        </div>
    </v-footer>
</template>

<script setup lang="ts">
import { getStatusStore } from '@/stores/StatusStore';
const statusStore = getStatusStore()

</script>

<style scoped lang="sass">
</style>
