<template>
	<div class="base-icon">
		<i v-if="isMDI" :class="mdiClass" :style="mdiStyle"></i>
		<svg v-else xmlns="http://www.w3.org/2000/svg"
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
// В директории public/icons должны лежать .svg файлы

import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		name: { type: String, required: true },
		width: { type: String },
		height: { type: String },
		vWidth: { type: String },
		vHeight: { type: String },
		size: { type: String, default: '1em' },
		stroke: { type: String, default: 'none', },
		fill: { type: String },
	},
	name: 'BaseIcon',
	data() {
		return {
			svgContent: null as string | null
		};
	},
	computed: {
		isMDI(): boolean {
			return this.name.startsWith('mdi-') || this.name.startsWith('mdil-');
		},
		mdiClass(): string {
			const base = this.name.startsWith('mdil-') ? 'mdil' : 'mdi';
			const name = this.name.replace(/^mdi(-light)?-/, 'mdi-');
			return `${base} ${name}`;
		},
		mdiStyle(): Record<string, string> {
			let fontSize = this.size;
			if( /\d$/.test(fontSize) ) fontSize += 'px';
			const styles = {} as Record<string, string>;
			if( this.fill ) styles.color = this.fill;
			if( fontSize ) styles.fontSize = fontSize;
			styles.lineHeight = '1em';

			return styles;
		},

		viewBox(): string {
			return `0 0 ${this.vWidth ?? 24} ${this.vHeight ?? 24}`;
		}
	},
	mounted() {
		if( !this.isMDI ) this.loadIcon(this.name);
	},
	methods: {
		async loadIcon(iconName: string) {
			try {
				const urlPrefix = String(import.meta.env.BASE_URL).replace(/\/$/, '');
				const response = await fetch(`${urlPrefix}/icons/${iconName}.svg`);
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
