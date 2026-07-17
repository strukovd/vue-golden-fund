<template>
	<div class="base-island">
		<h4 v-if="title" class="bi-title">
			<BaseIcon v-if="prependIcon" :name="prependIcon" size="1.2em" style="margin-right:.4em; color:#2563ea;"></BaseIcon>
			<span>{{ title }}</span>
		</h4>
		<slot name="default"></slot>
	</div>
</template>

<script lang="ts" setup>
import BaseIcon from './BaseIcon.vue';

const props = defineProps({
	title: String,
	prependIcon: String
});
</script>

<style lang="scss">
.base-island {
	background-color:#ffffff;
	border:1px solid #e5e5e5;
	padding:1.2em;
	border-radius:12px;
	// margin-top:1em;

	// border: 1px solid rgba(37, 99, 234, 0.12);
	// box-shadow: 0 18px 42px rgba(37, 99, 234, 0.08);
	// border-radius: 24px;

	.bi-title {
		display: flex;
    	align-items: center;
		color: #172b4d;
		font-weight: 700;
		font-size:1em;
		border-bottom: 1px solid #eff6ff;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
	}
}
</style>
