import { isRef } from 'vue';

type ResizebleConfig = {
	width: number;
	min?: number;
	max?: number;
	side?: 'left' | 'right';
};

const DEFAULT_WIDTH = 300;
const DEFAULT_MIN = 200;
const DEFAULT_MAX = 1600;

const resolveParams = (bindingValue: any): ResizebleConfig | null => {
	if (typeof bindingValue === 'number') return { width: bindingValue };
	else if (typeof bindingValue === 'string') return { width: parseInt(bindingValue) };
	else if (typeof bindingValue === 'object' && bindingValue.width !== undefined) { return bindingValue as ResizebleConfig; }
	else return { width: DEFAULT_WIDTH };
};


export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.directive('resizeble', {
		mounted(el, binding) {
			const params = resolveParams(binding.value);
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

			const min = Number.isFinite(params.min) ? Number(params.min) : DEFAULT_MIN;
			const max = Number.isFinite(params.max) ? Number(params.max) : DEFAULT_MAX;
			const side = params.side ?? 'left';

			const onMouseMove = (event: MouseEvent) => {
				if (event.movementX === 0) return;
				const delta = side === 'left' ? -event.movementX : event.movementX;
				params.width = Math.max(min, Math.min(max, params.width + delta));
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



/*
.v-resizeble-handle {
	position: absolute;
	width: 1px;
	background: #f0f0f0;
	z-index: 99;
	top: 0;
	bottom: 0;
	height:100%;
	cursor: e-resize;
	border-radius: 3px;
	transition: all 100ms ease 0s;

	&[data-side='left'] {
		left: 0;
	}

	&[data-side='right'] {
		right: 0;
	}

	&:hover {
		background: #0079C2;
		width: 3px;
	}
}
*/