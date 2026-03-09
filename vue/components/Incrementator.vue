<template>
	<span ref="element">{{ displayedValue }}</span>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";

export default defineComponent({
	props: {
		duration: { type: Number, default: 1500, },
		value: { type: Number, required: true, },
	},
	setup(props) {
		const displayedValue = ref(0); // Текущее значение для отображения
		const startTime = ref<number | null>(null); // Время начала анимации
		const element = ref<HTMLElement | null>(null); // Ссылка на DOM-элемент
		let observer: IntersectionObserver | null = null;

		const animate = (timestamp: number) => {
			if (!startTime.value) startTime.value = timestamp; // Устанавливаем начальное время
			const elapsed = timestamp - startTime.value; // Время с начала анимации
			const progress = Math.min(elapsed / props.duration, 1); // Прогресс от 0 до 1

			displayedValue.value = Math.round(props.value * progress); // Вычисляем текущее значение

			if (progress < 1) {
				requestAnimationFrame(animate); // Продолжаем анимацию
			}
		};

		const startAnimation = () => {
			if (startTime.value === null) {
				requestAnimationFrame(animate); // Запускаем анимацию
			}
		};

		const handleIntersection = (entries: IntersectionObserverEntry[]) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
				startAnimation(); // Начинаем анимацию, если элемент появился в области видимости
				observer?.disconnect(); // Отключаем наблюдатель, чтобы анимация запускалась только один раз
				}
			});
		};

		onMounted(() => {
			if (element.value) {
				observer = new IntersectionObserver(handleIntersection, {
				root: null, // Вся область просмотра
				threshold: 0.1, // 10% элемента должно быть видно
				});
				observer.observe(element.value); // Начинаем наблюдение за элементом
			}
		});

		onBeforeUnmount(() => {
			observer?.disconnect(); // Очищаем наблюдатель при удалении компонента
		});

		return {
			displayedValue,
			element,
		};
	},
});
</script>
