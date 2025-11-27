<template>
	<div class="base-pageable">
		<main>
			<slot name="default"></slot>
		</main>

		<footer class="bp-footer">
			<div class="bp-meta" v-if="total">
				<span>
					Показано
					<strong>{{ shownFrom }}</strong>–<strong>{{ shownTo }}</strong>
					из <strong>{{ total }}</strong>
					(страниц: {{ pagesCount }})
				</span>
			</div>

			<div class="bp-pager" v-if="pagesCount">
				<BaseButton
					:disabled="isFirstPage"
					prependIcon="mdi-menu-left"
					variant="secondary"
					@click="goTo(currentPage - 1)"
					aria-label="Предыдущая страница"
				/>

				<BaseButton
					v-for="(p, idx) of items"
					:key="`p-${idx}-${p}`"
					:variant="p === currentPage ? 'primary' : 'secondary'"
					:disabled="p === currentPage || p === '...'"
					@click="goTo(p)"
				>
					{{ p }}
				</BaseButton>

				<BaseButton
					:disabled="isLastPage"
					prependIcon="mdi-menu-right"
					variant="secondary"
					@click="goTo(currentPage + 1)"
					aria-label="Следующая страница"
				/>
			</div>
		</footer>
	</div>
</template>

<script lang="ts">
import { defineComponent, computed, watch, ref } from 'vue';
import BaseButton from './BaseButton.vue';

export default defineComponent({
	name: 'BasePageable',
	components: { BaseButton },

	props: {
		page: { type: Number, default: 1 },         // v-model:page
		limit: { type: Number, default: 10 },
		total: { type: Number, required: true },
		siblingCount: { type: Number, default: 1 }, // количество соседних страниц
		boundaryCount: { type: Number, default: 1 }, // количество первых и последних страниц
		showFirstLast: { type: Boolean, default: true }, // показывать первую и последнюю страницу
	},

	emits: ['update:page', 'change'],

	setup(props, { emit }) {
		const pagesCount = computed(() => Math.max(1, Math.ceil(props.total / props.limit)));
		const currentPage = ref(Math.min(Math.max(Number(props.page), 1), pagesCount.value));
		// const currentPage = computed(() => {
		// 	const p = Number(props.page) || 1;
		// 	return Math.min(Math.max(p, 1), pagesCount.value);
		// });
		const isFirstPage = computed(() => currentPage.value <= 1);
		const isLastPage = computed(() => currentPage.value >= pagesCount.value);
		const shownFrom = computed(() => (props.total === 0 ? 0 : (currentPage.value - 1) * props.limit + 1));
		const shownTo = computed(() => Math.min(currentPage.value * props.limit, props.total));

		function range(start: number, end: number): number[] {
			const out: number[] = [];
			for (let i = start; i <= end; i++) out.push(i);
			return out;
		}

		const items = computed<(number | string)[]>(() => {
			const total = pagesCount.value;
			const curPage = currentPage.value;

			const bc = Math.max(0, props.boundaryCount); // количество первых и последних страниц
			const sc = Math.max(0, props.siblingCount); // количество соседних страниц

			if (total <= 1) return [1];

			const res = [];
			// добавляем соседние страницы
			if(sc > 0) {
				const scAmount = sc * 2;
				const scStart = Math.max(1, curPage - sc);
				const scEnd = Math.min(total, (curPage - sc) + scAmount);

				for (let i = scStart; i <= scEnd; i++) {
					if (i > 0 && i <= total) {
						res.push(i);
					}
				}
			}
			else {
				res.push(curPage);
			}

			if(bc > 0) {
				let beforePages = [];
				for(let i=1; beforePages.length < bc; i++) {
					beforePages.push(i);
				}
				let afterPages = [];
				for(let i=total-bc; afterPages.length < bc; i++) {
					afterPages.push(i+1);
				}

				// let beforePages = range(1, bc-1);
				// let afterPages = range(total-bc, total);

				// Добавляем первые страницы, если они меньше уже добавленных
				if(beforePages[beforePages.length-1] < res[0]) {
					if(beforePages[beforePages.length-1]+1 < res[0]) { // если есть пропуск, то добавляем точки
						beforePages.push('...');
					}
				}
				else {
					beforePages = [];
				}

				if(afterPages[0] > res[res.length-1]) {
					if(afterPages[0]-1 > res[res.length-1]) { // если есть пропуск, то добавляем точки
						afterPages.unshift('...');
					}
				}
				else {
					afterPages = [];
				}

				res.unshift(...beforePages);
				res.push(...afterPages);
			}

			return res;
		});

		function goTo(p: number | string) {
			if(typeof p !== 'number') return;

			const next = Math.min(Math.max(1, p), pagesCount.value);
			if (next !== props.page) {
				emit('update:page', next);
				emit('change', next);
			}
		}

		watch(pagesCount, (n) => {
			if (props.page > n) emit('update:page', n);
			if (props.page < 1) emit('update:page', 1);
		});

		return {
			currentPage,
			pagesCount,
			shownFrom,
			shownTo,
			isFirstPage,
			isLastPage,
			items,
			goTo,
		};
	},
});
</script>

<style lang="scss">
	.base-pageable { display: flex; flex-direction: column; }
	.bp-footer { display:flex; justify-content: space-between; align-items:center; gap:.75rem; margin-top:.75rem; }
	.bp-meta { font-size:.85em; color:#808080; }
	.bp-pager { display: flex; gap: .25rem; }
</style>
