<template>
	<div class="base-island">
		<h2 v-if="title" class="bi-title">
			<v-icon v-if="prependIcon" :icon="prependIcon" size="1.2em" style="margin-right:.3em; opacity:.7;"></v-icon>
			<span>{{ title }}</span>
		</h2>
		<div class="content">
			<slot name="default"></slot>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'BaseIsland',
	props: {
		title: String,
		prependIcon: String
	},
	data() {
		return {};
	},
	methods: {},
});
</script>

<style lang="scss">
.base-island {
	background-color:#ffffff;
	padding:1.6em;
	border-radius:6px;
	margin:.6em;
	// border:1px solid #f3f3f3; // #e0e2e791
	// box-shadow: 0 0 3px 0 rgba(0,0,0,.05);
	box-shadow: 0px 0px 30px rgba(3, 100, 165, 0.1);

	&:not(:last-child) {
		margin-bottom: 1.6em;
	}

	.bi-title {
		color: #172b4d;
		font-weight: 400;
		margin-bottom: 1em;
		background: #fdfdfd;
		border-radius: 5px;
		// border: 1px solid #f0f0f0;
		padding:.2em 0;
	}

	>.content {
		// background-color: #fdfdfd;
		// padding:1.6em;
		// border-radius:6px;
		// border:1px solid #f3f3f3;
	}
}
</style>
