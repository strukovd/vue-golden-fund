<template>
	<button type="button"
		class="base-button"
		:class="[buttonColor, { 'disabled': disabled }]"
		:style="{
			color: !disabled && secondary && color ? color : '',
			borderColor: !disabled && secondary && color ? color : '',
			background: !disabled && !secondary && color ? color : ''
		}"
	>
		<!-- <v-icon v-if="prependIcon" :icon="prependIcon" size="1.2em" style="margin-right:.3em; opacity:.8;"></v-icon> -->
		<span style="font-weight:300;"><slot name="default"></slot></span>
	</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'BaseButton',
	props: {
		prependIcon: String,
		disabled: { type: Boolean, default: false },
		secondary: { type: Boolean, default: false },
		color: String
	},
	computed: {
		buttonColor() {
			return this.secondary ? 'secondary' : 'primary';
		}
	},
	data() {
		return {};
	},
	methods: {},
});
</script>

<style lang="scss">
.base-button {
	// background: #0079C1;
	// color: #fff;

	// line-height:1.4em;
	// background: #EBF1FF;
	// color: #0079C1;
	font-weight: 500;
	border-radius: 4px;
	box-shadow: none;
	padding:.4em 1em .4em .8em;
	user-select: none;
	transition:all 300ms ease 0s;
	border-style: none;

	&.disabled {
		background: #ffffff55;
		color: #c5c5c5;
		border: 1px solid #e5e5e5;
		cursor: inherit;
		pointer-events: none;
	}

	&:not(.disabled) {
		cursor: pointer;

		&.primary {
			background: #0079C1;
			color: #fff;

			// background: #FFFFFF;
			// border-radius: 6px;
			// border: 1px solid rgba(224, 226, 231, 0.56);
		}

		&.secondary {
			background: #ffffff55;
			color: #0079C1dd;
			border: 1px solid #0079C1;

			// background: #EBF1FF;
			// color: #0079C1;
		}

		&:hover {
			opacity:.8;
		}
	}
}
</style>
