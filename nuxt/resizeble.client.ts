type ResizebleConfig = {
	width?: number;
	min?: number;
	max?: number;
	side?: 'left' | 'right';
};
type ResolvedResizebleConfig = {
	width: number;
	min: number;
	max: number;
	side: 'left' | 'right';
};

const DEFAULT_WIDTH = 300;
const DEFAULT_MIN = 200;
const DEFAULT_MAX = 1600;
const DEFAULT_SIDE = 'left' as 'left' | 'right';

const resolveParams = (bindingValue: any, el: HTMLElement): ResolvedResizebleConfig | null => {
	const computedStyle = window.getComputedStyle(el);
	let width = Number.isFinite(parseFloat(computedStyle.width)) ? parseFloat(computedStyle.width) : DEFAULT_WIDTH;
	let side = DEFAULT_SIDE;
	let min = DEFAULT_MIN;
	let max = DEFAULT_MAX;

	if(bindingValue !== undefined && bindingValue !== null) {
		if (typeof bindingValue === 'number') width = bindingValue;
		else if (typeof bindingValue === 'string') {
			if( [`left`,`right`].includes(bindingValue) ) { // Если "left" или "right"
				side = bindingValue as 'left' | 'right';
			}
			else if( Number.isFinite(parseInt(bindingValue)) ) { // Если число
				width = parseInt(bindingValue);
			}
			else { // Неизвестное
				console.warn(`Unknown binding value "${bindingValue}"`);
			}
		}
		else if (typeof bindingValue === 'object') {
			if( [`left`,`right`].includes(bindingValue.side) ) side = bindingValue.side;
			if(Number.isFinite(parseInt(bindingValue.width))) width = parseInt(bindingValue.width);
			if(Number.isFinite(parseInt(bindingValue.min))) min = parseInt(bindingValue.min);
			if(Number.isFinite(parseInt(bindingValue.max))) max = parseInt(bindingValue.max);
		}
	}

	return {
		width,
		min,
		max,
		side,
	};
};


export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.directive('resizeble', {
		mounted(el, binding) {
			const params = resolveParams(binding.value, el);
			if (!params) return;

			// Создаем div.v-resizeble-handle - элемент для ресайза
			const div = document.createElement('div');
			div.className = 'v-resizeble-handle';
			div.dataset.side = params.side ?? 'left';
			el.appendChild(div);

			// Делаем relative
			const computed = window.getComputedStyle(el);
			if (computed.position === 'static') {
				(el as HTMLElement).style.position = 'relative';
			}

			const { min, max, side } = params;
			const onMouseMove = (event: MouseEvent) => {
				if (event.movementX === 0) return;
				const delta = side === 'left' ? -event.movementX : event.movementX;
				params.width = Math.max(min, Math.min(max, params.width! + delta));
				(el as HTMLElement).style.width = `${params.width}px`;
			};

			const onMouseUp = () => {
				document.removeEventListener('mousemove', onMouseMove);
				document.removeEventListener('mouseup', onMouseUp);
				document.body.style.userSelect = '';
			};

			const onMouseDown = (event: MouseEvent) => {
				event.preventDefault();
				document.addEventListener('mousemove', onMouseMove);
				document.addEventListener('mouseup', onMouseUp);
				document.body.style.userSelect = 'none';
			};

			div.addEventListener('mousedown', onMouseDown);

			(el as any).__resizeble = { handle: div, onMouseDown, onMouseMove, onMouseUp };
		},

		unmounted(el) {
			const state = (el as any).__resizeble;
			if (!state) return;
			state.handle.removeEventListener('mousedown', state.onMouseDown);
			document.removeEventListener('mousemove', state.onMouseMove);
			document.removeEventListener('mouseup', state.onMouseUp);
			state.handle.remove();
			delete (el as any).__resizeble;
		},
	});
});
