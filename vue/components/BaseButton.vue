<template>
	<button type="button"
		class="base-button"
		:class="[variant, { 'disabled': disabled }]"
		:style="{
			color: !disabled && variant === 'secondary' && color ? color : '',
			borderColor: !disabled && variant === 'secondary' && color ? color : '',
			background: !disabled && variant !== 'secondary' && color ? color : ''
		}"
	>
		<BaseIcon v-if="prependIcon" fill="currentColor" size="1.2em" :name="prependIcon"/>
		<div class="button-text"><slot name="default"></slot></div>
		<BaseIcon v-if="appendIcon" fill="currentColor" size="1.2em" :name="appendIcon"/>
	</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseIcon from '~/components/common/BaseIcon.vue';

export default defineComponent({
	name: 'BaseButton',
	components: { BaseIcon },
	props: {
		prependIcon: String,
		appendIcon: String,
		disabled: { type: Boolean, default: false },
		color: String,
		variant: {
			type: String as () => 'primary' | 'secondary',
			default: 'primary'
		},
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
	padding:.6em 1em .6em .8em;
	user-select: none;
	transition:all 300ms ease 0s;
	border-style: none;
	display: inline-flex;
	align-items: center;
	gap: .3em;

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
			font-weight: 700;
			// border: 1px solid rgba(224, 226, 231, 0.56);

			// border-radius: 5px;
			// background-color: rgb(240 247 255);
			// font-weight: 300;
			// color: rgb(0 95 242 / .9);
			// border:1px solid rgb(203 231 255);
			// font-size: .85em;
		}

		&.secondary {
			background: rgba(9,30,66,.08);
			// background: color-mix(in srgb, currentcolor 3%, transparent 97%);
			color: #344563;
			border: 1px solid transparent;

			// background: #EBF1FF;
			// color: #0079C1;
		}

		&:hover {
			opacity:.8;
		}
	}


	.button-text {
		font-weight: 300;
		text-align: center;
    	flex: auto 1 1;
	}
}
</style>