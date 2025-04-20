<template>
	<div class="base-icon">
		<svg xmlns="http://www.w3.org/2000/svg"
			:width="size ?? width"
			:height="size ?? height"
			:viewBox="viewBox"
			:fill="fill"
			:stroke="stroke"
			v-html="svgContent"
		></svg>
	</div>
</template>

<script lang="ts">
// В директории icons должны лежать svg файлы

import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		name: { type: String, default: '', },
		width: { type: String, default: '24' },
		height: { type: String, default: '24' },
		vWidth: { type: String },
		vHeight: { type: String },
		size: { type: String, default: '24' },
		stroke: { type: String, default: 'none', },
		fill: { type: String, default: '#000000', },
	},
	name: 'BaseIcon',
	data() {
		return {
			svgContent: null as string | null
		};
	},
	computed: {
		viewBox(): string {
			return `0 0 ${this.vWidth ?? 24} ${this.vHeight ?? 24}`;
		}
	},
	mounted() {
		this.loadIcon(this.name);
	},
	methods: {
		async loadIcon(iconName: string) {
			try {
				const response = await fetch(`/icons/${iconName}.svg`);
				if (!response.ok) throw new Error('Icon not found');
				this.svgContent = await response.text();
			} catch (error) {
				console.error(`Failed to load icon: ${iconName}`, error);
			}
		}
	},
});
</script>

<style lang="scss">
.base-icon {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	// width: 100%;
}
</style>
