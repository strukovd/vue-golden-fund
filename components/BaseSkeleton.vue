<template>
  <div class="base-skeleton" :style="skeletonStyle"></div>
</template>

<script lang="ts">
export default {
	name: 'SkeletonLoader',
	props: {
		width: { type: String, default: '100%' },
		height: { type: String, default: '1em' },
		borderRadius: { type: String, default: '8px' },
	},
	computed: {
		skeletonStyle() {
			return {
				width: this.width,
				height: this.height,
				borderRadius: this.borderRadius,
			};
		},
	},
};
</script>

<style scoped>
.base-skeleton {
	background-color: #ebf1ff;
	background-image: linear-gradient(90deg, #ebf1ff, #d8e1ff, #ebf1ff);
	background-size: 200% 100%;
	animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
	0% {
		background-position: 200% 0;
	}

	100% {
		background-position: -200% 0;
	}
}
</style>
