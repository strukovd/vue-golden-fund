<template>
	<div class="text-box" :class="{ 'invalid': error }" @keydown.enter="button?.onClick" >
		<label>
			<div class="text-box-wrapper">
				<header class="header" style="display:flex; align-items:center; padding-right:1em;">
					<div v-if="label" class="caption-container" style="flex:auto 1 1;">
						<span class="caption">{{ label }}</span>
					</div>
					<div v-if="error" class="error-container"
						style="display:flex; gap:.2em; justify-content:flex-end; font-size:14px; color:red; opacity:.6; line-height:1.4em;">
						<!--						<v-icon icon="mdi-alert-decagram" size="1.2em"></v-icon>-->
						<span class="error-message">{{ error }}</span>
					</div>
				</header>
				<section class="text-box-section">
					<!-- <v-icon v-if="appendIcon" class="append-icon" :icon="appendIcon" color="rgba(23, 43, 77, 0.7)" size="1.4em"></v-icon>-->
					<input :type="type" :placeholder="placeholder" :value="modelValue" @input="onInput" :autofocus="autofocus">
					<!-- <v-icon v-if="type === 'password'" :icon="hideValue ? 'mdi-eye-outline' : 'mdi-eye-off-outline'" size="1.4em" @click="hideValue = !hideValue"></v-icon>-->
					<BaseButton v-if="button && button.onClick" @click="button.onClick" secondary>{{ button.text }}</BaseButton>
				</section>
			</div>
		</label>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseButton from './BaseButton.vue';

type InnerButton = {
	text: string,
	onClick: () => void
};

export default defineComponent({
	// TODO: добавить .lazy директиву
	name: 'BaseTextBox',
	components: { BaseButton },
	props: {
		modelValue: [String, Number],
		label: String,
		appendIcon: String,
		placeholder: String,
		type: {
			type: String as () => 'text' | 'password' | 'color'
				| 'date' | 'datetime'
				| 'datetime-local' | 'month' | 'tel'
				| 'time' | 'url' | 'week' | 'email' | 'number',
			default: 'text'
		},
		autofocus: Boolean,
		button: { type: Object as () => InnerButton },
		error: String
	},
	emits: ['update:modelValue'],
	data() {
		return {
			hideValue: false
		};
	},
	created() {
		this.hideValue = this.type === 'password';
	},
	methods: {
		onInput(event: Event) {
			this.$emit('update:modelValue', (event.target as any)?.value ?? '');
		}
	},
});
</script>

<style lang="scss">
.text-box {
	.text-box-wrapper {
		margin: 0 0 .6em 0;

		.caption {
		font-size: 14px;
		opacity: .6;
		line-height: 1.4em;
		margin-bottom: .4em;
		}

		.text-box-section {
		display: flex;
		align-items: center;
		white-space: nowrap;
		text-wrap: nowrap;
		font-size: 16px;
		background: #FFFFFF;
		border-radius: 6px;
		border: 1px solid #E0E2E791;
		line-height: 1.4em;
		font-weight: 500;
		box-shadow: none;
		padding: .4em .4em .4em .6em;


		&:focus-within {
			box-shadow: 0 0 0 2px #0079C1aa;
		}

		.v-icon {
			padding-top: .1em;
			margin-right: .3em;
			opacity: .8;

			// font-size: 1.4em;
			// display: flex;
			// align-items: center;
			// padding: 1em 2em 1em 2em;
			// margin-bottom: 0;
			// font-weight: 400;
			// color: #5c6873;
			// background-color: #f0f3f5;
			// border: 1px solid #e4e7ea;
			// border-radius: 0 5px 5px 0;
		}

		& > input {
			flex: auto 1 0;
			color: inherit;
			outline: none;
			font-size: 16px;
			box-sizing: border-box;
			background: transparent;
			// padding:.5em .7em;
			padding: 0.4em .4em;
			border-style: none;

			&::placeholder {
			font-weight: 300;
			opacity: .6;
			}
		}
		}

	}

	&.invalid {
		.text-box-section {
		border-color: red;
		border-style: dashed;
		color: red;

		// outline:1px dashed red;
		// color: red;
		}
	}
}
</style>
